package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

type APIKeyRepository struct {
	db DBExecutor
}

func NewAPIKeyRepository(db DBExecutor) *APIKeyRepository {
	return &APIKeyRepository{db: db}
}

func (r *APIKeyRepository) Create(ctx context.Context, userID, keyHash, name string) (*model.APIKey, error) {
	const query = `
        INSERT INTO api_keys (user_id, key_hash, name)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, key_hash, name, last_used_at, created_at
    `

	var key model.APIKey
	err := r.db.QueryRow(ctx, query, userID, keyHash, name).Scan(
		&key.ID,
		&key.UserID,
		&key.KeyHash,
		&key.Name,
		&key.LastUsedAt,
		&key.CreatedAt,
	)

	if err != nil {
		if isUniqueViolation(err) {
			return nil, model.ErrAlreadyExists
		}
		return nil, fmt.Errorf("failed to create api key: %w", err)
	}

	return &key, nil
}

func (r *APIKeyRepository) GetByHash(ctx context.Context, keyHash string) (*model.APIKey, error) {
	const query = `
        SELECT id, user_id, key_hash, name, last_used_at, created_at
        FROM api_keys
        WHERE key_hash = $1
    `

	var key model.APIKey
	err := r.db.QueryRow(ctx, query, keyHash).Scan(
		&key.ID,
		&key.UserID,
		&key.KeyHash,
		&key.Name,
		&key.LastUsedAt,
		&key.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get api key by hash: %w", err)
	}

	return &key, nil
}

func (r *APIKeyRepository) ListByUserID(ctx context.Context, userID string) ([]model.APIKey, error) {
	const query = `
        SELECT id, user_id, key_hash, name, last_used_at, created_at
        FROM api_keys
        WHERE user_id = $1
        ORDER BY seq DESC
    `

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list api keys: %w", err)
	}
	defer rows.Close()

	keys := make([]model.APIKey, 0)
	for rows.Next() {
		var key model.APIKey
		if err := rows.Scan(
			&key.ID,
			&key.UserID,
			&key.KeyHash,
			&key.Name,
			&key.LastUsedAt,
			&key.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan api key row: %w", err)
		}
		keys = append(keys, key)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading api key rows: %w", err)
	}

	return keys, nil
}

func (r *APIKeyRepository) CountByUserID(ctx context.Context, userID string) (int, error) {
	const query = `SELECT COUNT(*) FROM api_keys WHERE user_id = $1`

	var count int
	if err := r.db.QueryRow(ctx, query, userID).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count api keys: %w", err)
	}

	return count, nil
}

func (r *APIKeyRepository) UpdateLastUsedAt(ctx context.Context, id string) error {
	const query = `
        UPDATE api_keys
        SET last_used_at = now()
        WHERE id = $1
    `

	tag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to update last_used_at: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}

func (r *APIKeyRepository) Delete(ctx context.Context, id, userID string) error {
	const query = `
        DELETE FROM api_keys
        WHERE id = $1 AND user_id = $2
    `

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete api key: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}
