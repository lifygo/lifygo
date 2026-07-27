package model

import "time"

type APIKey struct {
	ID         string     `json:"id" db:"id"`
	UserID     string     `json:"user_id" db:"user_id"`
	KeyHash    string     `json:"-" db:"key_hash"`
	Name       string     `json:"name" db:"name"`
	LastUsedAt *time.Time `json:"last_used_at" db:"last_used_at"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}

type APIKeyResponse struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	RawKey     string     `json:"key"`
	LastUsedAt *time.Time `json:"last_used_at"`
	CreatedAt  time.Time  `json:"created_at"`
}

type CreateAPIKeyInput struct {
	UserID string
	Name   string
}

func (i *CreateAPIKeyInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Name == "" {
		return ErrAPIKeyNameRequired
	}
	return nil
}
