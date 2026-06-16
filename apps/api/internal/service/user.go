package service

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// UserRepository defines the database operations the UserService needs.
// Using an interface here instead of the concrete *repository.UserRepository
// means we can swap in a fake/mock version during unit tests without
// needing a real database connection.
type UserRepository interface {
	Create(ctx context.Context, input model.CreateUserInput) (*model.User, error)
	GetByID(ctx context.Context, id string) (*model.User, error)
	GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error)
	Delete(ctx context.Context, id string) error
}

// UserService handles all business logic related to users.
// It sits between the HTTP handler layer and the repository layer.
// Handlers call services. Services call repositories.
// Repositories call the database.
type UserService struct {
	users UserRepository
}

// NewUserService creates a new UserService.
func NewUserService(users UserRepository) *UserService {
	return &UserService{users: users}
}

// CreateFromClerk creates a new user from a Clerk webhook payload.
// Called when Clerk sends us a "user.created" event after someone
// signs in with Google or GitHub for the first time.
//
// If the user already exists (same clerk_user_id or email), we return
// the existing user rather than an error. This makes the webhook
// handler idempotent — safe to call multiple times with the same data,
// which Clerk may do if it retries a failed webhook delivery.
func (s *UserService) CreateFromClerk(ctx context.Context, input model.CreateUserInput) (*model.User, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	user, err := s.users.Create(ctx, input)
	if err != nil {
		// If the user already exists, look them up and return them.
		// This handles the case where Clerk retries a webhook we
		// already processed successfully.
		if err == model.ErrAlreadyExists {
			existing, lookupErr := s.users.GetByClerkUserID(ctx, input.ClerkUserID)
			if lookupErr != nil {
				return nil, fmt.Errorf("user already exists but lookup failed: %w", lookupErr)
			}
			return existing, nil
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetByClerkUserID looks up a user by their Clerk user ID.
// Used by the auth middleware to map an incoming Clerk session token
// to our internal user record.
// Returns model.ErrNotFound if no user has that Clerk ID.
func (s *UserService) GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error) {
	if clerkUserID == "" {
		return nil, model.ErrClerkUserIDRequired
	}

	user, err := s.users.GetByClerkUserID(ctx, clerkUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by clerk id: %w", err)
	}

	return user, nil
}

// GetByID looks up a user by their internal UUID.
// Returns model.ErrNotFound if no user has that ID.
func (s *UserService) GetByID(ctx context.Context, id string) (*model.User, error) {
	if id == "" {
		return nil, model.ErrNotFound
	}

	user, err := s.users.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	return user, nil
}

// Delete removes a user and all of their data.
// Because of ON DELETE CASCADE in the database schema, this also
// removes all of their API keys, SMTP config, and email logs.
// Returns model.ErrNotFound if no user has that ID.
func (s *UserService) Delete(ctx context.Context, id string) error {
	if id == "" {
		return model.ErrNotFound
	}

	if err := s.users.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}
