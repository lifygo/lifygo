package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// UserRepository talks to the "users" table in PostgreSQL.
// It does not contain any business logic — only database queries.
// All business rules live in internal/service.
type UserRepository struct {
	db DBExecutor
}

// NewUserRepository creates a new UserRepository.
// db is the database connection pool (or a transaction, for testing).
func NewUserRepository(db DBExecutor) *UserRepository {
	return &UserRepository{db: db}
}

// Create inserts a new user row.
// This is called when we receive a "user.created" webhook from Clerk.
// Returns the full user record, including the generated ID and timestamp.
func (r *UserRepository) Create(ctx context.Context, input model.CreateUserInput) (*model.User, error) {
	const query = `
		INSERT INTO users (clerk_user_id, name, email)
		VALUES ($1, $2, $3)
		RETURNING id, clerk_user_id, name, email, created_at
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, input.ClerkUserID, input.Name, input.Email).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
		&user.CreatedAt,
	)

	if err != nil {
		// "unique_violation" means a user with this clerk_user_id or
		// email already exists. We turn that into a clear domain error
		// instead of leaking the raw Postgres error.
		if isUniqueViolation(err) {
			return nil, model.ErrAlreadyExists
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

// GetByID fetches a single user by their internal UUID.
// Returns model.ErrNotFound if no user has that ID.
func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, name, email, created_at
		FROM users
		WHERE id = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
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

// GetByClerkUserID fetches a single user by their Clerk user ID.
// This is the main lookup used when a request comes in with a
// Clerk session token — we need to map the Clerk ID to our internal user.
// Returns model.ErrNotFound if no user has that Clerk ID.
func (r *UserRepository) GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, name, email, created_at
		FROM users
		WHERE clerk_user_id = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, clerkUserID).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Name,
		&user.Email,
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

// Delete removes a user by their internal UUID.
// Because of "ON DELETE CASCADE" in the migrations, this also deletes
// all of that user's API keys, SMTP config, and email logs automatically.
// Returns model.ErrNotFound if no user has that ID.
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
