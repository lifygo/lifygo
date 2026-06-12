package model

import "time"

// EmailLog represents a record of an email sending attempt.
// Every call to POST /send and POST /send/otp creates one log entry
// regardless of whether the send succeeded or failed.
type EmailLog struct {
	// ID is the internal UUID primary key.
	ID string `json:"id" db:"id"`

	// UserID is the UUID of the user who sent the email.
	UserID string `json:"user_id" db:"user_id"`

	// To is the recipient email address.
	To string `json:"to" db:"to"`

	// Subject is the email subject line.
	Subject string `json:"subject" db:"subject"`

	// Status represents the outcome of the send attempt.
	// Possible values: sent, failed
	Status EmailStatus `json:"status" db:"status"`

	// ErrorMessage holds the error detail if Status is failed.
	// Nil if Status is sent.
	ErrorMessage *string `json:"error_message,omitempty" db:"error_message"`

	// SentAt is the timestamp of the send attempt.
	SentAt time.Time `json:"sent_at" db:"sent_at"`
}

// EmailStatus represents the outcome of an email send attempt.
type EmailStatus string

const (
	// EmailStatusSent means the SMTP server accepted the message.
	EmailStatusSent EmailStatus = "sent"

	// EmailStatusFailed means the SMTP server rejected the message
	// or a connection error occurred.
	EmailStatusFailed EmailStatus = "failed"
)

// SendEmailInput holds the data required to send a single email.
// Populated from the POST /send request body.
type SendEmailInput struct {
	// UserID is set internally from the authenticated API key.
	// Never taken from the request body.
	UserID string

	// To is the recipient email address.
	To string `json:"to"`

	// Subject is the email subject line.
	Subject string `json:"subject"`

	// Body is the plain text or HTML email body.
	Body string `json:"body"`

	// IsHTML indicates whether Body should be sent as text/html.
	// Default: false (plain text)
	IsHTML bool `json:"is_html"`
}

// Validate checks that all required fields are present and valid.
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

// SendEmailResponse is the shape returned to the client after
// a successful email send.
type SendEmailResponse struct {
	// LogID is the ID of the created EmailLog record.
	// Can be used to look up the send attempt in GET /logs.
	LogID  string      `json:"log_id"`
	Status EmailStatus `json:"status"`
	SentAt time.Time   `json:"sent_at"`
}

// ListEmailLogsInput holds the pagination and filter parameters
// for GET /logs.
type ListEmailLogsInput struct {
	// UserID is set internally from the authenticated API key.
	UserID string

	// Limit is the maximum number of records to return.
	// Default: 50. Maximum: 100.
	Limit int `json:"limit"`

	// Offset is the number of records to skip.
	// Used for pagination.
	Offset int `json:"offset"`

	// Status filters logs by outcome.
	// Optional — if empty, all logs are returned.
	Status *EmailStatus `json:"status,omitempty"`
}
