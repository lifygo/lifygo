package service

import (
	"context"
	"fmt"
	"time"

	"github.com/robfig/cron/v3"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// maxJobsPerUser is the maximum number of active jobs a single user
// can have at any one time on the free tier.
const maxJobsPerUser = 3

// JobRepository defines the database operations the JobService needs.
type JobRepository interface {
	Create(ctx context.Context, input model.CreateJobInput) (*model.Job, error)
	GetByID(ctx context.Context, id string) (*model.Job, error)
	ListByUserID(ctx context.Context, userID string) ([]model.Job, error)
	ListActiveDue(ctx context.Context) ([]model.Job, error)
	UpdateStatus(ctx context.Context, id string, status model.JobStatus) error
	Delete(ctx context.Context, id, userID string) error
	CreateExecution(ctx context.Context, jobID, userID, status string, httpStatus *int, errorMessage *string, durationMs *int) (*model.JobExecution, error)
	ListExecutionsByJobID(ctx context.Context, jobID string, limit, offset int) ([]model.JobExecution, error)
}

// JobService handles all business logic related to scheduled jobs.
type JobService struct {
	jobs JobRepository
}

// NewJobService creates a new JobService.
func NewJobService(jobs JobRepository) *JobService {
	return &JobService{jobs: jobs}
}

// Create creates a new scheduled job for the given user.
// Validates the input, enforces the job limit, and validates
// the cron expression if the job is a cron job.
func (s *JobService) Create(ctx context.Context, input model.CreateJobInput) (*model.Job, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	// Validate the cron expression if this is a cron job.
	if input.ScheduleType == model.JobScheduleTypeCron {
		if err := validateCronExpression(*input.CronExpression); err != nil {
			return nil, fmt.Errorf("invalid cron expression: %w", err)
		}
	}

	// Validate that one-time jobs are scheduled in the future.
	if input.ScheduleType == model.JobScheduleTypeOneTime {
		if input.RunAt.Before(time.Now().UTC()) {
			return nil, fmt.Errorf("run_at must be in the future")
		}
	}

	// Validate webhook URL format for webhook jobs.
	if input.Type == model.JobTypeWebhook {
		if err := validateWebhookURL(*input.WebhookURL); err != nil {
			return nil, fmt.Errorf("invalid webhook url: %w", err)
		}
	}

	// Enforce the per-user job limit.
	jobs, err := s.jobs.ListByUserID(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to count jobs: %w", err)
	}

	activeCount := 0
	for _, j := range jobs {
		if j.Status == model.JobStatusActive {
			activeCount++
		}
	}

	if activeCount >= maxJobsPerUser {
		return nil, model.ErrJobLimitReached
	}

	job, err := s.jobs.Create(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to create job: %w", err)
	}

	return job, nil
}

// Get returns a job by ID.
// Verifies ownership — the job must belong to userID.
func (s *JobService) Get(ctx context.Context, id, userID string) (*model.Job, error) {
	if id == "" || userID == "" {
		return nil, model.ErrNotFound
	}

	job, err := s.jobs.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get job: %w", err)
	}

	// Verify ownership.
	if job.UserID != userID {
		return nil, model.ErrNotFound
	}

	return job, nil
}

// List returns all jobs belonging to a user.
func (s *JobService) List(ctx context.Context, userID string) ([]model.Job, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	jobs, err := s.jobs.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list jobs: %w", err)
	}

	return jobs, nil
}

// Delete removes a job owned by the given user.
func (s *JobService) Delete(ctx context.Context, id, userID string) error {
	if id == "" || userID == "" {
		return model.ErrNotFound
	}

	if err := s.jobs.Delete(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to delete job: %w", err)
	}

	return nil
}

// ListExecutions returns execution history for a specific job.
// Verifies ownership before returning results.
func (s *JobService) ListExecutions(ctx context.Context, jobID, userID string, limit, offset int) ([]model.JobExecution, error) {
	if jobID == "" || userID == "" {
		return nil, model.ErrNotFound
	}

	// Verify the job belongs to the user.
	job, err := s.jobs.GetByID(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("failed to get job: %w", err)
	}
	if job.UserID != userID {
		return nil, model.ErrNotFound
	}

	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	execs, err := s.jobs.ListExecutionsByJobID(ctx, jobID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list executions: %w", err)
	}

	return execs, nil
}

// validateCronExpression checks that a cron expression is valid.
// Uses the robfig/cron parser which supports standard 5-field cron syntax.
func validateCronExpression(expr string) error {
	parser := cron.NewParser(
		cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow,
	)
	if _, err := parser.Parse(expr); err != nil {
		return fmt.Errorf("invalid cron expression %q: %w", expr, err)
	}
	return nil
}

// validateWebhookURL checks that a webhook URL is a valid HTTP/HTTPS URL.
func validateWebhookURL(url string) error {
	if len(url) == 0 {
		return fmt.Errorf("webhook url is required")
	}
	if len(url) < 8 {
		return fmt.Errorf("webhook url is too short")
	}
	if url[:7] != "http://" && url[:8] != "https://" {
		return fmt.Errorf("webhook url must start with http:// or https://")
	}
	return nil
}
