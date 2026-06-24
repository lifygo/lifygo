package service

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/robfig/cron/v3"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
)

// SchedulerSMTPConfigService defines what the scheduler needs from
// the SMTP config service to send email jobs.
type SchedulerSMTPConfigService interface {
	GetMailer(ctx context.Context, userID string) (*mailer.Mailer, error)
}

// Scheduler is a background worker that runs inside the Go API process.
// Every minute it checks the database for jobs that are due and executes them.
//
// For cron jobs: it uses robfig/cron to determine if a job is due
// based on its cron expression.
//
// For one-time jobs: the database query already filters for jobs
// with run_at <= now, so any one-time job returned is ready to fire.
type Scheduler struct {
	jobs   JobRepository
	smtp   SchedulerSMTPConfigService
	logger *slog.Logger
	stopCh chan struct{}
	http   *http.Client
}

// NewScheduler creates a new Scheduler.
func NewScheduler(jobs JobRepository, smtp SchedulerSMTPConfigService) *Scheduler {
	return &Scheduler{
		jobs: jobs,
		smtp: smtp,
		logger: slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})),
		stopCh: make(chan struct{}),
		http: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Start begins the scheduler loop in a background goroutine.
// It ticks every minute and checks for due jobs.
// Call Stop() to shut it down gracefully.
func (s *Scheduler) Start() {
	s.logger.Info("scheduler started")

	go func() {
		// Run once immediately on startup so we don't wait a full minute
		// before the first check.
		s.tick()

		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				s.tick()
			case <-s.stopCh:
				s.logger.Info("scheduler stopped")
				return
			}
		}
	}()
}

// Stop signals the scheduler to stop after the current tick finishes.
func (s *Scheduler) Stop() {
	close(s.stopCh)
}

// tick fetches all active due jobs and executes each one.
// Each job is executed in its own goroutine so slow jobs
// don't block other jobs from firing on time.
func (s *Scheduler) tick() {
	ctx, cancel := context.WithTimeout(context.Background(), 55*time.Second)
	defer cancel()

	jobs, err := s.jobs.ListActiveDue(ctx)
	if err != nil {
		s.logger.Error("scheduler failed to fetch due jobs", slog.Any("error", err))
		return
	}

	if len(jobs) == 0 {
		return
	}

	s.logger.Info("scheduler tick", slog.Int("due_jobs", len(jobs)))

	for _, job := range jobs {
		job := job // capture range variable for goroutine
		go s.executeJob(job)
	}
}

// executeJob determines whether a cron job is actually due right now,
// then dispatches to the correct executor based on job type.
func (s *Scheduler) executeJob(job model.Job) {
	// For cron jobs, check if the expression says it should fire right now.
	// We check within a 1-minute window to account for the tick interval.
	if job.ScheduleType == model.JobScheduleTypeCron {
		due, err := isCronDue(*job.CronExpression)
		if err != nil {
			s.logger.Error("invalid cron expression",
				slog.String("job_id", job.ID),
				slog.Any("error", err),
			)
			return
		}
		if !due {
			return
		}
	}

	s.logger.Info("executing job",
		slog.String("job_id", job.ID),
		slog.String("type", string(job.Type)),
	)

	var execErr error
	var httpStatus *int
	start := time.Now()

	switch job.Type {
	case model.JobTypeWebhook:
		httpStatus, execErr = s.executeWebhook(job)
	case model.JobTypeEmail:
		execErr = s.executeEmail(job)
	}

	durationMs := int(time.Since(start).Milliseconds())
	status := "success"
	var errMsg *string

	if execErr != nil {
		status = "failed"
		msg := execErr.Error()
		errMsg = &msg
		s.logger.Error("job execution failed",
			slog.String("job_id", job.ID),
			slog.Any("error", execErr),
		)
	} else {
		s.logger.Info("job executed successfully",
			slog.String("job_id", job.ID),
			slog.Int("duration_ms", durationMs),
		)
	}

	// Write the execution log.
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if _, err := s.jobs.CreateExecution(ctx, job.ID, job.UserID, status, httpStatus, errMsg, &durationMs); err != nil {
		s.logger.Error("failed to write execution log",
			slog.String("job_id", job.ID),
			slog.Any("error", err),
		)
	}

	// For one-time jobs, mark as completed or failed after execution.
	if job.ScheduleType == model.JobScheduleTypeOneTime {
		finalStatus := model.JobStatusCompleted
		if execErr != nil {
			finalStatus = model.JobStatusFailed
		}
		if err := s.jobs.UpdateStatus(ctx, job.ID, finalStatus); err != nil {
			s.logger.Error("failed to update one-time job status",
				slog.String("job_id", job.ID),
				slog.Any("error", err),
			)
		}
	}
}

// executeWebhook fires an HTTP POST request to the job's webhook URL.
// Returns the HTTP status code and any error.
func (s *Scheduler) executeWebhook(job model.Job) (*int, error) {
	if job.WebhookURL == nil {
		return nil, fmt.Errorf("webhook url is nil")
	}

	var body io.Reader
	if job.WebhookPayload != nil && *job.WebhookPayload != "" {
		body = strings.NewReader(*job.WebhookPayload)
	}

	req, err := http.NewRequest(http.MethodPost, *job.WebhookURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to build webhook request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "LifyGo-Scheduler/1.0")

	resp, err := s.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("webhook request failed: %w", err)
	}
	defer resp.Body.Close()

	status := resp.StatusCode

	// Treat any non-2xx response as a failure.
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return &status, fmt.Errorf("webhook returned non-2xx status: %d", resp.StatusCode)
	}

	return &status, nil
}

// executeEmail sends an email using the user's SMTP config.
func (s *Scheduler) executeEmail(job model.Job) error {
	if job.EmailTo == nil || job.EmailSubject == nil || job.EmailBody == nil {
		return fmt.Errorf("email job is missing required fields")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	m, err := s.smtp.GetMailer(ctx, job.UserID)
	if err != nil {
		return fmt.Errorf("failed to get mailer for user %s: %w", job.UserID, err)
	}

	if err := m.Send(mailer.Message{
		To:      *job.EmailTo,
		Subject: *job.EmailSubject,
		Body:    *job.EmailBody,
		IsHTML:  false,
	}); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// isCronDue checks whether a cron expression should fire within
// the current minute window.
// It checks if the expression would have fired between now-1min and now.
func isCronDue(expr string) (bool, error) {
	parser := cron.NewParser(
		cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow,
	)

	schedule, err := parser.Parse(expr)
	if err != nil {
		return false, fmt.Errorf("invalid cron expression: %w", err)
	}

	now := time.Now().UTC()
	// Truncate to the minute so we check if the schedule fires in this minute.
	minuteStart := now.Truncate(time.Minute)
	// If the next fire time from (minuteStart - 1s) is within this minute
	// window, the job is due now.
	nextFire := schedule.Next(minuteStart.Add(-1 * time.Second))

	return !nextFire.After(minuteStart.Add(time.Minute - time.Second)), nil
}
