package model

import "time"

// JobType represents what a job does when it fires.
type JobType string

const (
	// JobTypeWebhook means LifyGo hits a URL when the job fires.
	JobTypeWebhook JobType = "webhook"

	// JobTypeEmail means LifyGo sends an email when the job fires.
	JobTypeEmail JobType = "email"
)

// JobScheduleType represents how a job is scheduled.
type JobScheduleType string

const (
	// JobScheduleTypeCron means the job fires on a recurring cron schedule.
	JobScheduleTypeCron JobScheduleType = "cron"

	// JobScheduleTypeOneTime means the job fires once at a specific time.
	JobScheduleTypeOneTime JobScheduleType = "one_time"
)

// JobStatus represents the current state of a job.
type JobStatus string

const (
	JobStatusActive    JobStatus = "active"
	JobStatusPaused    JobStatus = "paused"
	JobStatusCompleted JobStatus = "completed"
	JobStatusFailed    JobStatus = "failed"
)

// Job represents a scheduled job created by a developer.
type Job struct {
	ID             string          `json:"id"              db:"id"`
	UserID         string          `json:"user_id"         db:"user_id"`
	Name           string          `json:"name"            db:"name"`
	Type           JobType         `json:"type"            db:"type"`
	ScheduleType   JobScheduleType `json:"schedule_type"   db:"schedule_type"`
	CronExpression *string         `json:"cron_expression" db:"cron_expression"`
	RunAt          *time.Time      `json:"run_at"          db:"run_at"`
	WebhookURL     *string         `json:"webhook_url"     db:"webhook_url"`
	WebhookPayload *string         `json:"webhook_payload" db:"webhook_payload"`
	EmailTo        *string         `json:"email_to"        db:"email_to"`
	EmailSubject   *string         `json:"email_subject"   db:"email_subject"`
	EmailBody      *string         `json:"email_body"      db:"email_body"`
	Status         JobStatus       `json:"status"          db:"status"`
	Enabled        bool            `json:"enabled"         db:"enabled"`
	CreatedAt      time.Time       `json:"created_at"      db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"      db:"updated_at"`
}

// JobExecution represents a single execution attempt of a job.
type JobExecution struct {
	ID           string    `json:"id"            db:"id"`
	JobID        string    `json:"job_id"        db:"job_id"`
	UserID       string    `json:"user_id"       db:"user_id"`
	Status       string    `json:"status"        db:"status"`
	HTTPStatus   *int      `json:"http_status"   db:"http_status"`
	ErrorMessage *string   `json:"error_message" db:"error_message"`
	DurationMs   *int      `json:"duration_ms"   db:"duration_ms"`
	ExecutedAt   time.Time `json:"executed_at"   db:"executed_at"`
}

// CreateJobInput holds the data required to create a new job.
type CreateJobInput struct {
	UserID         string
	Name           string
	Type           JobType
	ScheduleType   JobScheduleType
	CronExpression *string
	RunAt          *time.Time
	WebhookURL     *string
	WebhookPayload *string
	EmailTo        *string
	EmailSubject   *string
	EmailBody      *string
}

// Validate checks that all required fields are present and consistent.
func (i *CreateJobInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Name == "" {
		return ErrJobNameRequired
	}
	if i.Type != JobTypeWebhook && i.Type != JobTypeEmail {
		return ErrJobTypeInvalid
	}
	if i.ScheduleType != JobScheduleTypeCron && i.ScheduleType != JobScheduleTypeOneTime {
		return ErrJobScheduleTypeInvalid
	}
	if i.ScheduleType == JobScheduleTypeCron && (i.CronExpression == nil || *i.CronExpression == "") {
		return ErrJobCronExpressionRequired
	}
	if i.ScheduleType == JobScheduleTypeOneTime && i.RunAt == nil {
		return ErrJobRunAtRequired
	}
	if i.Type == JobTypeWebhook && (i.WebhookURL == nil || *i.WebhookURL == "") {
		return ErrJobWebhookURLRequired
	}
	if i.Type == JobTypeEmail {
		if i.EmailTo == nil || *i.EmailTo == "" {
			return ErrJobEmailToRequired
		}
		if i.EmailSubject == nil || *i.EmailSubject == "" {
			return ErrJobEmailSubjectRequired
		}
		if i.EmailBody == nil || *i.EmailBody == "" {
			return ErrJobEmailBodyRequired
		}
	}
	return nil
}
