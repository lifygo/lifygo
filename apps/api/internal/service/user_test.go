package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/service"
)

// -----------------------------------------------------------------------
// CreateFromClerk
// -----------------------------------------------------------------------

func TestUserService_CreateFromClerk(t *testing.T) {
	t.Parallel()

	t.Run("creates a new user successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		input := model.CreateUserInput{
			ClerkUserID: "clerk_abc123",
			Name:        "Jane Doe",
			Email:       "jane@example.com",
		}

		user, err := svc.CreateFromClerk(context.Background(), input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if user.ClerkUserID == nil || *user.ClerkUserID != input.ClerkUserID {
			t.Errorf("ClerkUserID: got %q want %q", *user.ClerkUserID, input.ClerkUserID)
		}
		if user.Email != input.Email {
			t.Errorf("Email: got %q want %q", user.Email, input.Email)
		}
	})

	t.Run("returns existing user when called twice with same clerk id — idempotent", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		input := model.CreateUserInput{
			ClerkUserID: "clerk_abc123",
			Name:        "Jane Doe",
			Email:       "jane@example.com",
		}

		first, err := svc.CreateFromClerk(context.Background(), input)
		if err != nil {
			t.Fatalf("first call failed: %v", err)
		}

		second, err := svc.CreateFromClerk(context.Background(), input)
		if err != nil {
			t.Fatalf("second call failed: %v", err)
		}

		// Both calls must return the same user.
		if first.ID != second.ID {
			t.Errorf("expected same user ID on both calls: got %q and %q", first.ID, second.ID)
		}
	})

	t.Run("returns error for missing clerk user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.CreateFromClerk(context.Background(), model.CreateUserInput{
			Name:  "Jane Doe",
			Email: "jane@example.com",
		})
		if !errors.Is(err, model.ErrClerkUserIDRequired) {
			t.Errorf("got %v, want %v", err, model.ErrClerkUserIDRequired)
		}
	})

	t.Run("returns error for missing name", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.CreateFromClerk(context.Background(), model.CreateUserInput{
			ClerkUserID: "clerk_abc123",
			Email:       "jane@example.com",
		})
		if !errors.Is(err, model.ErrNameRequired) {
			t.Errorf("got %v, want %v", err, model.ErrNameRequired)
		}
	})

	t.Run("returns error for missing email", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.CreateFromClerk(context.Background(), model.CreateUserInput{
			ClerkUserID: "clerk_abc123",
			Name:        "Jane Doe",
		})
		if !errors.Is(err, model.ErrEmailRequired) {
			t.Errorf("got %v, want %v", err, model.ErrEmailRequired)
		}
	})
}

// -----------------------------------------------------------------------
// GetByClerkUserID
// -----------------------------------------------------------------------

func TestUserService_GetByClerkUserID(t *testing.T) {
	t.Parallel()

	t.Run("finds an existing user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		clerkID := "clerk_xyz"
		repo.users["user_1"] = &model.User{
			ID:          "user_1",
			ClerkUserID: &clerkID,
			Name:        "Test User",
			Email:       "test@example.com",
		}
		repo.byClerkID["clerk_xyz"] = repo.users["user_1"]

		user, err := svc.GetByClerkUserID(context.Background(), "clerk_xyz")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if user.ClerkUserID == nil || *user.ClerkUserID != "clerk_xyz" {
			t.Errorf("ClerkUserID: got %v want clerk_xyz", user.ClerkUserID)
		}
	})

	t.Run("returns ErrNotFound for unknown clerk id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.GetByClerkUserID(context.Background(), "clerk_does_not_exist")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns error for empty clerk id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.GetByClerkUserID(context.Background(), "")
		if !errors.Is(err, model.ErrClerkUserIDRequired) {
			t.Errorf("got %v, want %v", err, model.ErrClerkUserIDRequired)
		}
	})
}

func TestUserService_GetByID(t *testing.T) {
	t.Parallel()

	t.Run("finds an existing user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		clerkID := "clerk_xyz"
		repo.users["user_1"] = &model.User{
			ID:          "user_1",
			ClerkUserID: &clerkID,
			Name:        "Test User",
			Email:       "test@example.com",
		}

		user, err := svc.GetByID(context.Background(), "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if user.ID != "user_1" {
			t.Errorf("ID: got %q want user_1", user.ID)
		}
	})

	t.Run("returns ErrNotFound for unknown id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.GetByID(context.Background(), "does_not_exist")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for empty id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		_, err := svc.GetByID(context.Background(), "")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestUserService_Delete(t *testing.T) {
	t.Parallel()

	t.Run("deletes an existing user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		clerkID := "clerk_xyz"
		repo.users["user_1"] = &model.User{
			ID:          "user_1",
			ClerkUserID: &clerkID,
			Name:        "Test User",
			Email:       "test@example.com",
		}
		repo.byClerkID["clerk_xyz"] = repo.users["user_1"]

		if err := svc.Delete(context.Background(), "user_1"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		_, err := svc.GetByID(context.Background(), "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for unknown id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		err := svc.Delete(context.Background(), "does_not_exist")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for empty id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeUserRepository()
		svc := service.NewUserService(repo)

		err := svc.Delete(context.Background(), "")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})
}
