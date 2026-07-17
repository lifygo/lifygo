package service_test

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/service"
)

// -----------------------------------------------------------------------
// Fake JobRepository
// -----------------------------------------------------------------------

type fakeJobRepository struct {
	jobs       map[string]*model.Job
	executions map[string][]*model.JobExecution
	createErr  error
	deleteErr  error
}

func newFakeJobRepository() *fakeJobRepository {
	return &fakeJobRepository{
		jobs:       make(map[string]*model.Job),
		executions: make(map[string][]*model.JobExecution),
	}
}

func (f *fakeJobRepository) Create(_ context.Context, input model.CreateJobInput) (*model.Job, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	job := &model.Job{
		ID:             "job_" + input.Name,
		UserID:         input.UserID,
		Name:           input.Name,
		Type:           input.Type,
		ScheduleType:   input.ScheduleType,
		CronExpression: input.CronExpression,
		RunAt:          input.RunAt,
		WebhookURL:     input.WebhookURL,
		WebhookPayload: input.WebhookPayload,
		EmailTo:        input.EmailTo,
		EmailSubject:   input.EmailSubject,
		EmailBody:      input.EmailBody,
		Status:         model.JobStatusActive,
		Enabled:        true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	f.jobs[job.ID] = job
	return job, nil
}

func (f *fakeJobRepository) GetByID(_ context.Context, id string) (*model.Job, error) {
	job, ok := f.jobs[id]
	if !ok {
		return nil, model.ErrNotFound
	}
	return job, nil
}

func (f *fakeJobRepository) ListByUserID(_ context.Context, userID string) ([]model.Job, error) {
	result := make([]model.Job, 0)
	for _, j := range f.jobs {
		if j.UserID == userID {
			result = append(result, *j)
		}
	}
	return result, nil
}

func (f *fakeJobRepository) ListActiveDue(_ context.Context) ([]model.Job, error) {
	result := make([]model.Job, 0)
	for _, j := range f.jobs {
		if j.Enabled && j.Status == model.JobStatusActive {
			result = append(result, *j)
		}
	}
	return result, nil
}

func (f *fakeJobRepository) UpdateStatus(_ context.Context, id string, status model.JobStatus) error {
	job, ok := f.jobs[id]
	if !ok {
		return model.ErrNotFound
	}
	job.Status = status
	return nil
}

func (f *fakeJobRepository) Delete(_ context.Context, id, userID string) error {
	if f.deleteErr != nil {
		return f.deleteErr
	}
	job, ok := f.jobs[id]
	if !ok || job.UserID != userID {
		return model.ErrNotFound
	}
	delete(f.jobs, id)
	return nil
}

func (f *fakeJobRepository) CreateExecution(_ context.Context, jobID, userID, status string, httpStatus *int, errorMessage *string, durationMs *int) (*model.JobExecution, error) {
	exec := &model.JobExecution{
		ID:           "exec_" + jobID,
		JobID:        jobID,
		UserID:       userID,
		Status:       status,
		HTTPStatus:   httpStatus,
		ErrorMessage: errorMessage,
		DurationMs:   durationMs,
		ExecutedAt:   time.Now(),
	}
	f.executions[jobID] = append(f.executions[jobID], exec)
	return exec, nil
}

func (f *fakeJobRepository) ListExecutionsByJobID(_ context.Context, jobID string, limit, offset int) ([]model.JobExecution, error) {
	execs := f.executions[jobID]
	result := make([]model.JobExecution, 0)
	for i, e := range execs {
		if i >= offset && i < offset+limit {
			result = append(result, *e)
		}
	}
	return result, nil
}

// -----------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------

func validWebhookCronInput(userID string) model.CreateJobInput {
	cronExpr := "0 9 * * 1"
	webhookURL := "https://example.com/webhook"
	return model.CreateJobInput{
		UserID:         userID,
		Name:           "weekly-report",
		Type:           model.JobTypeWebhook,
		ScheduleType:   model.JobScheduleTypeCron,
		CronExpression: &cronExpr,
		WebhookURL:     &webhookURL,
	}
}

func validEmailOneTimeInput(userID string) model.CreateJobInput {
	runAt := time.Now().Add(24 * time.Hour)
	emailTo := "user@example.com"
	emailSubject := "Weekly digest"
	emailBody := "Here is your digest."
	return model.CreateJobInput{
		UserID:       userID,
		Name:         "one-time-email",
		Type:         model.JobTypeEmail,
		ScheduleType: model.JobScheduleTypeOneTime,
		RunAt:        &runAt,
		EmailTo:      &emailTo,
		EmailSubject: &emailSubject,
		EmailBody:    &emailBody,
	}
}

// -----------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------

func TestJobService_Create(t *testing.T) {
	t.Parallel()

	t.Run("creates a webhook cron job successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		job, err := svc.Create(context.Background(), validWebhookCronInput("user_1"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if job.Type != model.JobTypeWebhook {
			t.Errorf("Type: got %q want %q", job.Type, model.JobTypeWebhook)
		}
		if job.Status != model.JobStatusActive {
			t.Errorf("Status: got %q want %q", job.Status, model.JobStatusActive)
		}
	})

	t.Run("creates a one-time email job successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		job, err := svc.Create(context.Background(), validEmailOneTimeInput("user_1"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if job.Type != model.JobTypeEmail {
			t.Errorf("Type: got %q want %q", job.Type, model.JobTypeEmail)
		}
	})

	t.Run("enforces maximum job limit of 3", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		for i := 0; i < 3; i++ {
			input := validWebhookCronInput("user_1")
			input.Name = fmt.Sprintf("job-%d", i)
			_, err := svc.Create(context.Background(), input)
			if err != nil {
				t.Fatalf("job %d creation failed: %v", i+1, err)
			}
		}

		input := validWebhookCronInput("user_1")
		input.Name = "one-too-many"
		_, err := svc.Create(context.Background(), input)
		if !errors.Is(err, model.ErrJobLimitReached) {
			t.Errorf("got %v want %v", err, model.ErrJobLimitReached)
		}
	})

	t.Run("rejects invalid cron expression", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		input := validWebhookCronInput("user_1")
		badCron := "not-a-cron"
		input.CronExpression = &badCron

		_, err := svc.Create(context.Background(), input)
		if err == nil {
			t.Error("expected error for invalid cron expression, got nil")
		}
	})

	t.Run("rejects one-time job with run_at in the past", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		input := validEmailOneTimeInput("user_1")
		pastTime := time.Now().Add(-1 * time.Hour)
		input.RunAt = &pastTime

		_, err := svc.Create(context.Background(), input)
		if err == nil {
			t.Error("expected error for past run_at, got nil")
		}
	})

	t.Run("rejects invalid webhook url", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		input := validWebhookCronInput("user_1")
		badURL := "not-a-url"
		input.WebhookURL = &badURL

		_, err := svc.Create(context.Background(), input)
		if err == nil {
			t.Error("expected error for invalid webhook url, got nil")
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		input := validWebhookCronInput("")
		_, err := svc.Create(context.Background(), input)
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("different users have separate job limits", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		for i := 0; i < 3; i++ {
			input := validWebhookCronInput("user_a")
			input.Name = fmt.Sprintf("job-%d", i)
			_, err := svc.Create(context.Background(), input)
			if err != nil {
				t.Fatalf("userA job %d failed: %v", i+1, err)
			}
		}

		input := validWebhookCronInput("user_b")
		input.Name = "user-b-first-job"
		_, err := svc.Create(context.Background(), input)
		if err != nil {
			t.Errorf("userB should be able to create a job but got: %v", err)
		}
	})
}

// -----------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------

func TestJobService_Get(t *testing.T) {
	t.Parallel()

	t.Run("returns job for owner", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		created, _ := svc.Create(context.Background(), validWebhookCronInput("user_1"))

		job, err := svc.Get(context.Background(), created.ID, "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if job.ID != created.ID {
			t.Errorf("ID: got %q want %q", job.ID, created.ID)
		}
	})

	t.Run("returns ErrNotFound for another user's job", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		created, _ := svc.Create(context.Background(), validWebhookCronInput("user_1"))

		_, err := svc.Get(context.Background(), created.ID, "user_2")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestJobService_Delete(t *testing.T) {
	t.Parallel()

	t.Run("deletes own job successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		created, _ := svc.Create(context.Background(), validWebhookCronInput("user_1"))

		err := svc.Delete(context.Background(), created.ID, "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		_, err = svc.Get(context.Background(), created.ID, "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for another user's job", func(t *testing.T) {
		t.Parallel()
		repo := newFakeJobRepository()
		svc := service.NewJobService(repo, nil)

		created, _ := svc.Create(context.Background(), validWebhookCronInput("user_1"))

		err := svc.Delete(context.Background(), created.ID, "user_2")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v", err, model.ErrNotFound)
		}
	})
}
