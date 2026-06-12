package model

import (
	"time"
)

// User represents a registered LifyGo user.
// Users authenticate via Clerk (Google or GitHub OAuth).
// We never store passwords — Clerk owns all credentials.
type User struct {
	// ID is the internal UUID primary key.
	ID string `json:"id" db:"id"`

	// ClerkUserID is the unique identifier assigned by Clerk.
	// This is the value we receive from Clerk webhooks and
	// session tokens. It is used to link Clerk identity to
	// our internal user record.
	ClerkUserID string `json:"clerk_user_id" db:"clerk_user_id"`

	// Name is the display name pulled from the OAuth provider.
	Name string `json:"name" db:"name"`

	// Email is pulled from the OAuth provider and kept in sync
	// via Clerk webhooks.
	Email string `json:"email" db:"email"`

	// CreatedAt is set once on insert and never updated.
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// CreateUserInput holds the data required to create a new user.
// This is populated from the Clerk webhook payload on user.created.
type CreateUserInput struct {
	ClerkUserID string
	Name        string
	Email       string
}

// Validate checks that all required fields are present and valid.
func (i *CreateUserInput) Validate() error {
	if i.ClerkUserID == "" {
		return ErrClerkUserIDRequired
	}
	if i.Name == "" {
		return ErrNameRequired
	}
	if i.Email == "" {
		return ErrEmailRequired
	}
	return nil
}
