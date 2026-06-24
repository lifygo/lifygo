package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// JobRepository talks to the "jobs" and "job_executions" tables in PostgreSQL.
// It does not contain any business logic — only database queries.
type JobRepository struct {
	db DBExecutor
}

// NewJobRepository creates a new JobRepository.
func NewJobRepository(db DBExecutor) *JobRepository {
	return &JobRepository{db: db}
}

// Create inserts a new job row.
func (r *JobRepository) Create(ctx context.Context, input model.CreateJobInput) (*model.Job, error) {
	const query = `
		INSERT INTO jobs (
			user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING
			id, user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body,
			status, enabled, created_at, updated_at
	`

	var job model.Job
	err := r.db.QueryRow(ctx, query,
		input.UserID,
		input.Name,
		input.Type,
		input.ScheduleType,
		input.CronExpression,
		input.RunAt,
		input.WebhookURL,
		input.WebhookPayload,
		input.EmailTo,
		input.EmailSubject,
		input.EmailBody,
	).Scan(
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
		&job.Enabled,
		&job.CreatedAt,
		&job.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create job: %w", err)
	}

	return &job, nil
}

// GetByID fetches a single job by its internal UUID.
// Returns model.ErrNotFound if no job has that ID.
func (r *JobRepository) GetByID(ctx context.Context, id string) (*model.Job, error) {
	const query = `
		SELECT
			id, user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body,
			status, enabled, created_at, updated_at
		FROM jobs
		WHERE id = $1
	`

	var job model.Job
	err := r.db.QueryRow(ctx, query, id).Scan(
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
		&job.Enabled,
		&job.CreatedAt,
		&job.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get job by id: %w", err)
	}

	return &job, nil
}

// ListByUserID returns all jobs belonging to a user, newest first.
func (r *JobRepository) ListByUserID(ctx context.Context, userID string) ([]model.Job, error) {
	const query = `
		SELECT
			id, user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body,
			status, enabled, created_at, updated_at
		FROM jobs
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list jobs: %w", err)
	}
	defer rows.Close()

	jobs := make([]model.Job, 0)
	for rows.Next() {
		var job model.Job
		if err := rows.Scan(
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
			&job.Enabled,
			&job.CreatedAt,
			&job.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan job row: %w", err)
		}
		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading job rows: %w", err)
	}

	return jobs, nil
}

// ListActiveDue returns all active, enabled jobs that are due to run.
// Used by the scheduler worker to find jobs to execute.
//
// A job is due if:
//   - It is a cron job that is active and enabled (always potentially due)
//   - It is a one-time job with run_at <= now that has not yet completed
func (r *JobRepository) ListActiveDue(ctx context.Context) ([]model.Job, error) {
	const query = `
		SELECT
			id, user_id, name, type, schedule_type,
			cron_expression, run_at,
			webhook_url, webhook_payload,
			email_to, email_subject, email_body,
			status, enabled, created_at, updated_at
		FROM jobs
		WHERE enabled = TRUE
		  AND status = 'active'
		  AND (
		    schedule_type = 'cron'
		    OR (schedule_type = 'one_time' AND run_at <= $1)
		  )
	`

	rows, err := r.db.Query(ctx, query, time.Now().UTC())
	if err != nil {
		return nil, fmt.Errorf("failed to list active due jobs: %w", err)
	}
	defer rows.Close()

	jobs := make([]model.Job, 0)
	for rows.Next() {
		var job model.Job
		if err := rows.Scan(
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
			&job.Enabled,
			&job.CreatedAt,
			&job.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan job row: %w", err)
		}
		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading job rows: %w", err)
	}

	return jobs, nil
}

// UpdateStatus updates the status of a job.
// Used by the scheduler after a one-time job completes or fails.
func (r *JobRepository) UpdateStatus(ctx context.Context, id string, status model.JobStatus) error {
	const query = `
		UPDATE jobs
		SET status = $1, updated_at = clock_timestamp()
		WHERE id = $2
	`

	tag, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update job status: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}

// Delete removes a job by ID.
// Checks ownership — the job must belong to userID.
// Because of ON DELETE CASCADE, all job_executions for this job
// are also deleted automatically.
func (r *JobRepository) Delete(ctx context.Context, id, userID string) error {
	const query = `DELETE FROM jobs WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete job: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}

// CreateExecution inserts a new job execution log row.
// Called by the scheduler after every job execution attempt.
func (r *JobRepository) CreateExecution(ctx context.Context, jobID, userID, status string, httpStatus *int, errorMessage *string, durationMs *int) (*model.JobExecution, error) {
	const query = `
		INSERT INTO job_executions (job_id, user_id, status, http_status, error_message, duration_ms)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, job_id, user_id, status, http_status, error_message, duration_ms, executed_at
	`

	var exec model.JobExecution
	err := r.db.QueryRow(ctx, query, jobID, userID, status, httpStatus, errorMessage, durationMs).Scan(
		&exec.ID,
		&exec.JobID,
		&exec.UserID,
		&exec.Status,
		&exec.HTTPStatus,
		&exec.ErrorMessage,
		&exec.DurationMs,
		&exec.ExecutedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create job execution: %w", err)
	}

	return &exec, nil
}

// ListExecutionsByJobID returns executions for a specific job, newest first.
func (r *JobRepository) ListExecutionsByJobID(ctx context.Context, jobID string, limit, offset int) ([]model.JobExecution, error) {
	const query = `
		SELECT id, job_id, user_id, status, http_status, error_message, duration_ms, executed_at
		FROM job_executions
		WHERE job_id = $1
		ORDER BY seq DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, jobID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list job executions: %w", err)
	}
	defer rows.Close()

	execs := make([]model.JobExecution, 0)
	for rows.Next() {
		var exec model.JobExecution
		if err := rows.Scan(
			&exec.ID,
			&exec.JobID,
			&exec.UserID,
			&exec.Status,
			&exec.HTTPStatus,
			&exec.ErrorMessage,
			&exec.DurationMs,
			&exec.ExecutedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan job execution row: %w", err)
		}
		execs = append(execs, exec)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading job execution rows: %w", err)
	}

	return execs, nil
}
