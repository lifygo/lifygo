package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

type UserRepository struct {
	db DBExecutor
}

func NewUserRepository(db DBExecutor) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, input model.CreateUserInput) (*model.User, error) {
	const query = `
		INSERT INTO users (clerk_user_id, name, email, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id, clerk_user_id, name, email, password_hash, created_at
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, strToNil(input.ClerkUserID), input.Name, input.Email, input.PasswordHash).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if isUniqueViolation(err) {
			return nil, model.ErrAlreadyExists
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, name, email, password_hash, created_at
		FROM users
		WHERE id = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, name, email, password_hash, created_at
		FROM users
		WHERE clerk_user_id = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, clerkUserID).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user by clerk user id: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, name, email, password_hash, created_at
		FROM users
		WHERE email = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	const query = `DELETE FROM users WHERE id = $1`

	tag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}

	return nil
}

func strToNil(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
