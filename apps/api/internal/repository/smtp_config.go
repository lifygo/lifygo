package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// SMTPConfigRepository talks to the "smtp_configs" table in PostgreSQL.
// It does not contain any business logic — only database queries.
// All business rules live in internal/service.
type SMTPConfigRepository struct {
	db DBExecutor
}

// NewSMTPConfigRepository creates a new SMTPConfigRepository.
func NewSMTPConfigRepository(db DBExecutor) *SMTPConfigRepository {
	return &SMTPConfigRepository{db: db}
}

// Upsert creates a new SMTP config for the user, or replaces the
// existing one if the user already has one.
//
// Why upsert instead of separate create/update:
// The schema enforces one SMTP config per user (UNIQUE on user_id).
// Rather than making the caller do a "does it exist?" check first,
// we use ON CONFLICT to handle both cases in a single atomic query.
// The caller does not need to know or care whether this is a first-time
// setup or an update.
//
// The password field that comes in must ALREADY be AES-256 encrypted
// by the service layer before calling this — this repository never
// sees or handles a plain-text password.
func (r *SMTPConfigRepository) Upsert(ctx context.Context, input model.CreateSMTPConfigInput, encryptedPassword string) (*model.SMTPConfig, error) {
	const query = `
		INSERT INTO smtp_configs (user_id, host, port, username, password_encrypted, from_address)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) DO UPDATE SET
			host               = EXCLUDED.host,
			port               = EXCLUDED.port,
			username           = EXCLUDED.username,
			password_encrypted = EXCLUDED.password_encrypted,
			from_address       = EXCLUDED.from_address,
			updated_at         = clock_timestamp()
		RETURNING id, user_id, host, port, username, password_encrypted, from_address, created_at, updated_at
	`

	var cfg model.SMTPConfig
	err := r.db.QueryRow(ctx, query,
		input.UserID,
		input.Host,
		input.Port,
		input.Username,
		encryptedPassword,
		input.FromAddress,
	).Scan(
		&cfg.ID,
		&cfg.UserID,
		&cfg.Host,
		&cfg.Port,
		&cfg.Username,
		&cfg.PasswordEncrypted,
		&cfg.FromAddress,
		&cfg.CreatedAt,
		&cfg.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to upsert smtp config: %w", err)
	}

	return &cfg, nil
}

// GetByUserID fetches the SMTP config for a given user.
// Returns model.ErrNotFound if the user has not set up SMTP yet.
// Used by the service layer before every email send to get the
// credentials needed to dial the SMTP server.
func (r *SMTPConfigRepository) GetByUserID(ctx context.Context, userID string) (*model.SMTPConfig, error) {
	const query = `
		SELECT id, user_id, host, port, username, password_encrypted, from_address, created_at, updated_at
		FROM smtp_configs
		WHERE user_id = $1
	`

	var cfg model.SMTPConfig
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&cfg.ID,
		&cfg.UserID,
		&cfg.Host,
		&cfg.Port,
		&cfg.Username,
		&cfg.PasswordEncrypted,
		&cfg.FromAddress,
		&cfg.CreatedAt,
		&cfg.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

	return &cfg, nil
}

// Delete removes the SMTP config for a given user.
// Returns model.ErrNotFound if the user has no SMTP config.
// Used when a user wants to disconnect their SMTP credentials.
func (r *SMTPConfigRepository) Delete(ctx context.Context, userID string) error {
	const query = `DELETE FROM smtp_configs WHERE user_id = $1`

	tag, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete smtp config: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}
