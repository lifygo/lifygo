package model

import "time"

type SMTPConfig struct {
	ID                string    `json:"id" db:"id"`
	UserID            string    `json:"user_id" db:"user_id"`
	Host              string    `json:"host" db:"host"`
	Port              int       `json:"port" db:"port"`
	Username          string    `json:"username" db:"username"`
	PasswordEncrypted string    `json:"-" db:"password_encrypted"`
	FromAddress       string    `json:"from_address" db:"from_address"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type SMTPConfigResponse struct {
	ID          string    `json:"id"`
	Host        string    `json:"host"`
	Port        int       `json:"port"`
	Username    string    `json:"username"`
	FromAddress string    `json:"from_address"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateSMTPConfigInput struct {
	UserID      string
	Host        string
	Port        int
	Username    string
	Password    string
	FromAddress string
}

func (i *CreateSMTPConfigInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.FromAddress == "" {
		return ErrSMTPFromRequired
	}
	if i.Host != "" {
		if i.Port == 0 {
			return ErrSMTPPortRequired
		}
		if i.Username == "" {
			return ErrSMTPUsernameRequired
		}
		if i.Password == "" {
			return ErrSMTPPasswordRequired
		}
	}
	return nil
}

func (i *CreateSMTPConfigInput) IsFullConfig() bool {
	return i.Host != ""
}
