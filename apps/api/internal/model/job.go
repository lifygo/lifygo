package model

import "time"

type JobType string

const (
	JobTypeWebhook JobType = "webhook"
	JobTypeEmail   JobType = "email"
)

type JobScheduleType string

const (
	JobScheduleTypeCron    JobScheduleType = "cron"
	JobScheduleTypeOneTime JobScheduleType = "one_time"
)

type JobStatus string

const (
	JobStatusActive    JobStatus = "active"
	JobStatusPaused    JobStatus = "paused"
	JobStatusCompleted JobStatus = "completed"
	JobStatusFailed    JobStatus = "failed"
)

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
	LastRunAt      *time.Time      `json:"last_run_at"     db:"last_run_at"`
	CreatedAt      time.Time       `json:"created_at"      db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"      db:"updated_at"`
}

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
