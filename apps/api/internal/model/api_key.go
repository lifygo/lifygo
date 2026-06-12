package model

import "time"

// APIKey represents an API key belonging to a user.
// The raw key is only ever shown once at generation time.
// We store only the SHA-256 hash — never the plain key.
type APIKey struct {
	// ID is the internal UUID primary key.
	ID string `json:"id" db:"id"`

	// UserID is the UUID of the user this key belongs to.
	UserID string `json:"user_id" db:"user_id"`

	// KeyHash is the SHA-256 hash of the raw API key.
	// Used to look up and verify incoming X-API-Key headers.
	// Never returned in any API response.
	KeyHash string `json:"-" db:"key_hash"`

	// Name is a human-readable label for the key.
	// Example: "production", "staging", "my-app"
	Name string `json:"name" db:"name"`

	// LastUsedAt is updated every time the key is used to
	// authenticate a request. Nil if the key has never been used.
	LastUsedAt *time.Time `json:"last_used_at" db:"last_used_at"`

	// CreatedAt is set once on insert and never updated.
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// APIKeyResponse is the shape returned to the client after creating
// a new API key. This is the only time the raw key is ever exposed.
// Once this response is sent, the raw key is gone — we only store
// the hash. The user must copy it immediately.
type APIKeyResponse struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	RawKey     string     `json:"key"`
	LastUsedAt *time.Time `json:"last_used_at"`
	CreatedAt  time.Time  `json:"created_at"`
}

// CreateAPIKeyInput holds the data required to create a new API key.
type CreateAPIKeyInput struct {
	UserID string
	Name   string
}

// Validate checks that all required fields are present and valid.
func (i *CreateAPIKeyInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Name == "" {
		return ErrAPIKeyNameRequired
	}
	return nil
}
