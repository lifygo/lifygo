package model

import "time"

type EmailLog struct {
	ID           string      `json:"id" db:"id"`
	UserID       string      `json:"user_id" db:"user_id"`
	To           string      `json:"to" db:"to"`
	Subject      string      `json:"subject" db:"subject"`
	Status       EmailStatus `json:"status" db:"status"`
	ErrorMessage *string     `json:"error_message,omitempty" db:"error_message"`
	SentAt       time.Time   `json:"sent_at" db:"sent_at"`
}

type EmailStatus string

const (
	EmailStatusSent   EmailStatus = "sent"
	EmailStatusFailed EmailStatus = "failed"
)

type SendEmailInput struct {
	UserID  string
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
	IsHTML  bool   `json:"is_html"`
}

func (i *SendEmailInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.To == "" {
		return ErrToRequired
	}
	if i.Subject == "" {
		return ErrSubjectRequired
	}
	if i.Body == "" {
		return ErrBodyRequired
	}
	return nil
}

type SendEmailResponse struct {
	LogID  string      `json:"log_id"`
	Status EmailStatus `json:"status"`
	SentAt time.Time   `json:"sent_at"`
}

type ListEmailLogsInput struct {
	UserID string
	Limit  int          `json:"limit"`
	Offset int          `json:"offset"`
	Status *EmailStatus `json:"status,omitempty"`
}
