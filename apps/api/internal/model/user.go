package model

import (
	"time"
)

type User struct {
	ID           string    `json:"id"             db:"id"`
	ClerkUserID  *string   `json:"clerk_user_id"  db:"clerk_user_id"`
	Name         string    `json:"name"           db:"name"`
	Email        string    `json:"email"          db:"email"`
	PasswordHash *string   `json:"-"              db:"password_hash"`
	CreatedAt    time.Time `json:"created_at"     db:"created_at"`
}

type CreateUserInput struct {
	ClerkUserID  string
	Name         string
	Email        string
	PasswordHash *string
}

func (i *CreateUserInput) Validate() error {
	if i.ClerkUserID == "" && i.PasswordHash == nil {
		return ErrClerkUserIDRequired
	}
	if i.ClerkUserID != "" && i.PasswordHash != nil {
		return ErrAmbiguousAuth
	}
	if i.Name == "" {
		return ErrNameRequired
	}
	if i.Email == "" {
		return ErrEmailRequired
	}
	return nil
}

func (u *User) GetID() string {
	return u.ID
}
