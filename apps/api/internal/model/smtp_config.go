package model

import "time"

// SMTPConfig holds the SMTP credentials for a user.
// Each user brings their own SMTP server — LifyGo never owns
// the sending infrastructure.
// The password is encrypted with AES-256 before storage and
// decrypted only at the moment of sending an email.
type SMTPConfig struct {
	// ID is the internal UUID primary key.
	ID string `json:"id" db:"id"`

	// UserID is the UUID of the user this config belongs to.
	UserID string `json:"user_id" db:"user_id"`

	// Host is the SMTP server hostname.
	// Example: smtp.gmail.com
	Host string `json:"host" db:"host"`

	// Port is the SMTP server port.
	// Common values: 587 (TLS), 465 (SSL), 25 (plain — avoid)
	Port int `json:"port" db:"port"`

	// Username is the SMTP authentication username.
	// Usually the sender email address.
	Username string `json:"username" db:"username"`

	// PasswordEncrypted is the AES-256 encrypted SMTP password.
	// Never returned in any API response.
	PasswordEncrypted string `json:"-" db:"password_encrypted"`

	// FromAddress is the email address used in the From header.
	// Example: hello@yourdomain.com
	FromAddress string `json:"from_address" db:"from_address"`

	// CreatedAt is set once on insert and never updated.
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// UpdatedAt is updated every time the config is modified.
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// SMTPConfigResponse is the shape returned to the client.
// Password is never included in any response.
type SMTPConfigResponse struct {
	ID          string    `json:"id"`
	Host        string    `json:"host"`
	Port        int       `json:"port"`
	Username    string    `json:"username"`
	FromAddress string    `json:"from_address"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateSMTPConfigInput holds the data required to create or update
// an SMTP config. One config per user — upsert on conflict.
type CreateSMTPConfigInput struct {
	UserID      string
	Host        string
	Port        int
	Username    string
	Password    string
	FromAddress string
}

// Validate checks that all required fields are present and valid.
func (i *CreateSMTPConfigInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Host == "" {
		return ErrSMTPHostRequired
	}
	if i.Port == 0 {
		return ErrSMTPPortRequired
	}
	if i.Username == "" {
		return ErrSMTPUsernameRequired
	}
	if i.Password == "" {
		return ErrSMTPPasswordRequired
	}
	if i.FromAddress == "" {
		return ErrSMTPFromRequired
	}
	return nil
}
