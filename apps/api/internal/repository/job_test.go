//go:build integration

package repository_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/repository"
)

// -----------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------

func TestJobRepository_Create(t *testing.T) {
	pool := newTestPool(t)

	t.Run("creates a webhook cron job successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		webhookURL := "https://example.com/webhook"
		cronExpr := "0 9 * * 1"

		job, err := repo.Create(context.Background(), model.CreateJobInput{
			UserID:         user.ID,
			Name:           "weekly-report",
			Type:           model.JobTypeWebhook,
			ScheduleType:   model.JobScheduleTypeCron,
			CronExpression: &cronExpr,
			WebhookURL:     &webhookURL,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if job.ID == "" {
			t.Error("expected job.ID to be set")
		}
		if job.UserID != user.ID {
			t.Errorf("UserID: got %q want %q", job.UserID, user.ID)
		}
		if job.Name != "weekly-report" {
			t.Errorf("Name: got %q want weekly-report", job.Name)
		}
		if job.Type != model.JobTypeWebhook {
			t.Errorf("Type: got %q want %q", job.Type, model.JobTypeWebhook)
		}
		if job.Status != model.JobStatusActive {
			t.Errorf("Status: got %q want %q", job.Status, model.JobStatusActive)
		}
		if !job.Enabled {
			t.Error("expected job to be enabled by default")
		}
	})

	t.Run("creates a one-time email job successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		runAt := time.Now().Add(24 * time.Hour)
		emailTo := "user@example.com"
		emailSubject := "Your weekly digest"
		emailBody := "Here is your digest."

		job, err := repo.Create(context.Background(), model.CreateJobInput{
			UserID:       user.ID,
			Name:         "one-time-email",
			Type:         model.JobTypeEmail,
			ScheduleType: model.JobScheduleTypeOneTime,
			RunAt:        &runAt,
			EmailTo:      &emailTo,
			EmailSubject: &emailSubject,
			EmailBody:    &emailBody,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if job.Type != model.JobTypeEmail {
			t.Errorf("Type: got %q want %q", job.Type, model.JobTypeEmail)
		}
		if job.ScheduleType != model.JobScheduleTypeOneTime {
			t.Errorf("ScheduleType: got %q want %q", job.ScheduleType, model.JobScheduleTypeOneTime)
		}
		if job.EmailTo == nil || *job.EmailTo != emailTo {
			t.Errorf("EmailTo: got %v want %q", job.EmailTo, emailTo)
		}
	})

	t.Run("rejects job for non-existent user", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewJobRepository(tx)

		webhookURL := "https://example.com/webhook"
		cronExpr := "0 9 * * 1"

		_, err := repo.Create(context.Background(), model.CreateJobInput{
			UserID:         "00000000-0000-0000-0000-000000000000",
			Name:           "orphan-job",
			Type:           model.JobTypeWebhook,
			ScheduleType:   model.JobScheduleTypeCron,
			CronExpression: &cronExpr,
			WebhookURL:     &webhookURL,
		})
		if err == nil {
			t.Error("expected error for non-existent user_id, got nil")
		}
	})
}

// -----------------------------------------------------------------------
// GetByID
// -----------------------------------------------------------------------

func TestJobRepository_GetByID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("finds an existing job", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestJob(t, tx, user.ID)
		repo := repository.NewJobRepository(tx)

		found, err := repo.GetByID(context.Background(), created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found.ID != created.ID {
			t.Errorf("ID: got %q want %q", found.ID, created.ID)
		}
	})

	t.Run("returns ErrNotFound for unknown id", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewJobRepository(tx)

		_, err := repo.GetByID(context.Background(), "00000000-0000-0000-0000-000000000000")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// ListByUserID
// -----------------------------------------------------------------------

func TestJobRepository_ListByUserID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("returns all jobs for a user", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		insertTestJob(t, tx, user.ID)
		insertTestJob(t, tx, user.ID)

		jobs, err := repo.ListByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(jobs) != 2 {
			t.Errorf("expected 2 jobs, got %d", len(jobs))
		}
	})

	t.Run("returns empty list for user with no jobs", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		jobs, err := repo.ListByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(jobs) != 0 {
			t.Errorf("expected 0 jobs, got %d", len(jobs))
		}
	})

	t.Run("does not return jobs belonging to other users", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		insertTestJob(t, tx, userA.ID)
		insertTestJob(t, tx, userB.ID)

		jobs, err := repo.ListByUserID(context.Background(), userA.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(jobs) != 1 {
			t.Errorf("expected 1 job for userA, got %d", len(jobs))
		}
		if jobs[0].UserID != userA.ID {
			t.Errorf("job belongs to %q want %q", jobs[0].UserID, userA.ID)
		}
	})
}

// -----------------------------------------------------------------------
// ListActiveDue
// -----------------------------------------------------------------------

func TestJobRepository_ListActiveDue(t *testing.T) {
	pool := newTestPool(t)

	t.Run("returns active cron jobs", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		insertTestJob(t, tx, user.ID)

		jobs, err := repo.ListActiveDue(context.Background())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found := false
		for _, j := range jobs {
			if j.UserID == user.ID {
				found = true
				break
			}
		}
		if !found {
			t.Error("expected to find the active cron job in due list")
		}
	})

	t.Run("returns one-time jobs with run_at in the past", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		// Create a one-time job with run_at in the past.
		pastTime := time.Now().Add(-1 * time.Hour)
		emailTo := "user@example.com"
		emailSubject := "Past job"
		emailBody := "This job was due an hour ago."

		job, err := repo.Create(context.Background(), model.CreateJobInput{
			UserID:       user.ID,
			Name:         "past-job",
			Type:         model.JobTypeEmail,
			ScheduleType: model.JobScheduleTypeOneTime,
			RunAt:        &pastTime,
			EmailTo:      &emailTo,
			EmailSubject: &emailSubject,
			EmailBody:    &emailBody,
		})
		if err != nil {
			t.Fatalf("failed to create past job: %v", err)
		}

		jobs, err := repo.ListActiveDue(context.Background())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found := false
		for _, j := range jobs {
			if j.ID == job.ID {
				found = true
				break
			}
		}
		if !found {
			t.Error("expected past one-time job to appear in due list")
		}
	})

	t.Run("does not return one-time jobs with run_at in the future", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		futureTime := time.Now().Add(24 * time.Hour)
		emailTo := "user@example.com"
		emailSubject := "Future job"
		emailBody := "This job is not due yet."

		job, err := repo.Create(context.Background(), model.CreateJobInput{
			UserID:       user.ID,
			Name:         "future-job",
			Type:         model.JobTypeEmail,
			ScheduleType: model.JobScheduleTypeOneTime,
			RunAt:        &futureTime,
			EmailTo:      &emailTo,
			EmailSubject: &emailSubject,
			EmailBody:    &emailBody,
		})
		if err != nil {
			t.Fatalf("failed to create future job: %v", err)
		}

		jobs, err := repo.ListActiveDue(context.Background())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		for _, j := range jobs {
			if j.ID == job.ID {
				t.Error("future one-time job must not appear in due list")
			}
		}
	})
}

// -----------------------------------------------------------------------
// UpdateStatus
// -----------------------------------------------------------------------

func TestJobRepository_UpdateStatus(t *testing.T) {
	pool := newTestPool(t)

	t.Run("updates status successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestJob(t, tx, user.ID)
		repo := repository.NewJobRepository(tx)

		err := repo.UpdateStatus(context.Background(), created.ID, model.JobStatusCompleted)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, err := repo.GetByID(context.Background(), created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found.Status != model.JobStatusCompleted {
			t.Errorf("Status: got %q want %q", found.Status, model.JobStatusCompleted)
		}
	})

	t.Run("returns ErrNotFound for unknown id", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewJobRepository(tx)

		err := repo.UpdateStatus(context.Background(), "00000000-0000-0000-0000-000000000000", model.JobStatusCompleted)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestJobRepository_Delete(t *testing.T) {
	pool := newTestPool(t)

	t.Run("deletes a job owned by the user", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestJob(t, tx, user.ID)
		repo := repository.NewJobRepository(tx)

		err := repo.Delete(context.Background(), created.ID, user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		_, err = repo.GetByID(context.Background(), created.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound when job belongs to another user", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewJobRepository(tx)

		created := insertTestJob(t, tx, userA.ID)

		err := repo.Delete(context.Background(), created.ID, userB.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// CreateExecution
// -----------------------------------------------------------------------

func TestJobRepository_CreateExecution(t *testing.T) {
	pool := newTestPool(t)

	t.Run("creates a successful execution", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		job := insertTestJob(t, tx, user.ID)
		repo := repository.NewJobRepository(tx)

		httpStatus := 200
		durationMs := 142

		exec, err := repo.CreateExecution(
			context.Background(),
			job.ID, user.ID,
			"success",
			&httpStatus, nil, &durationMs,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if exec.ID == "" {
			t.Error("expected exec.ID to be set")
		}
		if exec.Status != "success" {
			t.Errorf("Status: got %q want success", exec.Status)
		}
		if exec.HTTPStatus == nil || *exec.HTTPStatus != 200 {
			t.Errorf("HTTPStatus: got %v want 200", exec.HTTPStatus)
		}
	})

	t.Run("creates a failed execution with error message", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		job := insertTestJob(t, tx, user.ID)
		repo := repository.NewJobRepository(tx)

		errMsg := "connection refused"

		exec, err := repo.CreateExecution(
			context.Background(),
			job.ID, user.ID,
			"failed",
			nil, &errMsg, nil,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if exec.Status != "failed" {
			t.Errorf("Status: got %q want failed", exec.Status)
		}
		if exec.ErrorMessage == nil || *exec.ErrorMessage != errMsg {
			t.Errorf("ErrorMessage: got %v want %q", exec.ErrorMessage, errMsg)
		}
	})
}
