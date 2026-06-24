package resolver

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Job holds the full job configuration fetched from PostgreSQL.
// This is a local copy of the job model — the worker has its own
// minimal struct rather than importing the API's model package,
// keeping the worker binary small and independent.
type Job struct {
	ID             string
	UserID         string
	Name           string
	Type           string
	ScheduleType   string
	CronExpression *string
	RunAt          *time.Time
	WebhookURL     *string
	WebhookPayload *string
	EmailTo        *string
	EmailSubject   *string
	EmailBody      *string
	Status         string
}

// SMTPConfig holds the SMTP credentials for a user.
// The password is stored encrypted — the executor decrypts it
// before use.
type SMTPConfig struct {
	Host              string
	Port              int
	Username          string
	PasswordEncrypted string
	FromAddress       string
}

// Resolver fetches job and SMTP config data from PostgreSQL.
// The Lambda worker calls this to get everything it needs
// before executing a job.
type Resolver struct {
	db *pgxpool.Pool
}

// New creates a new Resolver.
func New(db *pgxpool.Pool) *Resolver {
	return &Resolver{db: db}
}

// GetJob fetches a job by ID from PostgreSQL.
// Returns an error if the job does not exist or does not
// belong to the given user.
func (r *Resolver) GetJob(ctx context.Context, jobID, userID string) (*Job, error) {
	const query = `
		SELECT
			id, user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body,
			status
		FROM jobs
		WHERE id = $1 AND user_id = $2
	`

	var job Job
	err := r.db.QueryRow(ctx, query, jobID, userID).Scan(
		&job.ID,
		&job.UserID,
		&job.Name,
		&job.Type,
		&job.ScheduleType,
		&job.CronExpression,
		&job.RunAt,
		&job.WebhookURL,
		&job.WebhookPayload,
		&job.EmailTo,
		&job.EmailSubject,
		&job.EmailBody,
		&job.Status,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("job not found: %s", jobID)
		}
		return nil, fmt.Errorf("failed to get job: %w", err)
	}

	return &job, nil
}

// GetSMTPConfig fetches the SMTP config for a user from PostgreSQL.
// Returns an error if the user has no SMTP config set up.
func (r *Resolver) GetSMTPConfig(ctx context.Context, userID string) (*SMTPConfig, error) {
	const query = `
		SELECT host, port, username, password_encrypted, from_address
		FROM smtp_configs
		WHERE user_id = $1
	`

	var cfg SMTPConfig
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&cfg.Host,
		&cfg.Port,
		&cfg.Username,
		&cfg.PasswordEncrypted,
		&cfg.FromAddress,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("no smtp config found for user: %s", userID)
		}
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

	return &cfg, nil
}

// LogExecution writes a job execution record to PostgreSQL.
// Called after every job execution attempt — success or failure.
func (r *Resolver) LogExecution(ctx context.Context, jobID, userID, status string, httpStatus *int, errorMessage *string, durationMs int) error {
	const query = `
		INSERT INTO job_executions (job_id, user_id, status, http_status, error_message, duration_ms)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	if _, err := r.db.Exec(ctx, query, jobID, userID, status, httpStatus, errorMessage, durationMs); err != nil {
		return fmt.Errorf("failed to log execution: %w", err)
	}

	return nil
}

// MarkJobCompleted marks a one-time job as completed after it fires.
func (r *Resolver) MarkJobCompleted(ctx context.Context, jobID string) error {
	const query = `
		UPDATE jobs
		SET status = 'completed', updated_at = clock_timestamp()
		WHERE id = $1
	`

	if _, err := r.db.Exec(ctx, query, jobID); err != nil {
		return fmt.Errorf("failed to mark job completed: %w", err)
	}

	return nil
}

// MarkJobFailed marks a one-time job as failed after all retries are exhausted.
func (r *Resolver) MarkJobFailed(ctx context.Context, jobID string) error {
	const query = `
		UPDATE jobs
		SET status = 'failed', updated_at = clock_timestamp()
		WHERE id = $1
	`

	if _, err := r.db.Exec(ctx, query, jobID); err != nil {
		return fmt.Errorf("failed to mark job failed: %w", err)
	}

	return nil
}
