//go:build integration

package repository_test

import (
	"context"
	"errors"
	"testing"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/repository"
)

// -----------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------

func TestUserRepository_Create(t *testing.T) {
	pool := newTestPool(t)

	t.Run("creates a new user successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		input := model.CreateUserInput{
			ClerkUserID: "clerk_" + randomSuffix(),
			Name:        "Jane Doe",
			Email:       "jane_" + randomSuffix() + "@example.com",
		}

		user, err := repo.Create(context.Background(), input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// The database should fill in an ID and a created_at time for us.
		if user.ID == "" {
			t.Error("expected user.ID to be set, got empty string")
		}
		if user.CreatedAt.IsZero() {
			t.Error("expected user.CreatedAt to be set, got zero time")
		}

		// The fields we sent in should come back unchanged.
		if user.ClerkUserID != input.ClerkUserID {
			t.Errorf("ClerkUserID: got %q want %q", user.ClerkUserID, input.ClerkUserID)
		}
		if user.Name != input.Name {
			t.Errorf("Name: got %q want %q", user.Name, input.Name)
		}
		if user.Email != input.Email {
			t.Errorf("Email: got %q want %q", user.Email, input.Email)
		}
	})

	t.Run("rejects duplicate clerk_user_id", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		clerkID := "clerk_dup_" + randomSuffix()

		// First insert should work fine.
		_, err := repo.Create(context.Background(), model.CreateUserInput{
			ClerkUserID: clerkID,
			Name:        "First User",
			Email:       "first_" + randomSuffix() + "@example.com",
		})
		if err != nil {
			t.Fatalf("first create failed unexpectedly: %v", err)
		}

		// Second insert with the SAME clerk_user_id but a different email
		// must fail, because clerk_user_id is unique.
		_, err = repo.Create(context.Background(), model.CreateUserInput{
			ClerkUserID: clerkID,
			Name:        "Second User",
			Email:       "second_" + randomSuffix() + "@example.com",
		})
		if !errors.Is(err, model.ErrAlreadyExists) {
			t.Errorf("got error %v, want %v", err, model.ErrAlreadyExists)
		}
	})

	t.Run("rejects duplicate email", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		email := "dup_" + randomSuffix() + "@example.com"

		// First insert should work fine.
		_, err := repo.Create(context.Background(), model.CreateUserInput{
			ClerkUserID: "clerk_a_" + randomSuffix(),
			Name:        "User A",
			Email:       email,
		})
		if err != nil {
			t.Fatalf("first create failed unexpectedly: %v", err)
		}

		// Second insert with the SAME email but a different clerk_user_id
		// must fail, because email is unique.
		_, err = repo.Create(context.Background(), model.CreateUserInput{
			ClerkUserID: "clerk_b_" + randomSuffix(),
			Name:        "User B",
			Email:       email,
		})
		if !errors.Is(err, model.ErrAlreadyExists) {
			t.Errorf("got error %v, want %v", err, model.ErrAlreadyExists)
		}
	})
}

// -----------------------------------------------------------------------
// GetByID
// -----------------------------------------------------------------------

func TestUserRepository_GetByID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("finds an existing user", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		created := insertTestUser(t, tx)

		found, err := repo.GetByID(context.Background(), created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if found.ID != created.ID {
			t.Errorf("ID: got %q want %q", found.ID, created.ID)
		}
		if found.Email != created.Email {
			t.Errorf("Email: got %q want %q", found.Email, created.Email)
		}
	})

	t.Run("returns ErrNotFound for a random valid UUID", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		// This UUID is correctly formatted but does not exist in the table.
		const randomUUID = "00000000-0000-0000-0000-000000000000"

		_, err := repo.GetByID(context.Background(), randomUUID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns an error for a badly formatted ID", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		// "not-a-uuid" is not a valid UUID. Postgres will reject this
		// before it even runs the query, so we should get some error
		// back — not a successful (but empty) result.
		_, err := repo.GetByID(context.Background(), "not-a-uuid")
		if err == nil {
			t.Error("expected an error for a badly formatted UUID, got nil")
		}
	})
}

// -----------------------------------------------------------------------
// GetByClerkUserID
// -----------------------------------------------------------------------

func TestUserRepository_GetByClerkUserID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("finds an existing user", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		created := insertTestUser(t, tx)

		found, err := repo.GetByClerkUserID(context.Background(), created.ClerkUserID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if found.ID != created.ID {
			t.Errorf("ID: got %q want %q", found.ID, created.ID)
		}
		if found.ClerkUserID != created.ClerkUserID {
			t.Errorf("ClerkUserID: got %q want %q", found.ClerkUserID, created.ClerkUserID)
		}
	})

	t.Run("returns ErrNotFound for an unknown clerk_user_id", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		_, err := repo.GetByClerkUserID(context.Background(), "clerk_does_not_exist_"+randomSuffix())
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestUserRepository_Delete(t *testing.T) {
	pool := newTestPool(t)

	t.Run("deletes an existing user", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		created := insertTestUser(t, tx)

		err := repo.Delete(context.Background(), created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// After deleting, looking it up again should return ErrNotFound.
		_, err = repo.GetByID(context.Background(), created.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound when deleting a user that does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		err := repo.Delete(context.Background(), randomUUID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("deleting a user also deletes their api keys (cascade)", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewUserRepository(tx)

		created := insertTestUser(t, tx)

		// Insert an api_key row directly for this user using raw SQL,
		// since the api_keys repository does not exist yet.
		_, err := tx.Exec(context.Background(), `
			INSERT INTO api_keys (user_id, key_hash, name)
			VALUES ($1, $2, $3)
		`, created.ID, "fake_hash_"+randomSuffix(), "test-key")
		if err != nil {
			t.Fatalf("failed to insert test api key: %v", err)
		}

		// Now delete the user.
		if err := repo.Delete(context.Background(), created.ID); err != nil {
			t.Fatalf("failed to delete user: %v", err)
		}

		// The api_key row should be gone too, because of
		// "ON DELETE CASCADE" in the migration.
		var count int
		err = tx.QueryRow(context.Background(), `
			SELECT COUNT(*) FROM api_keys WHERE user_id = $1
		`, created.ID).Scan(&count)
		if err != nil {
			t.Fatalf("failed to count api keys: %v", err)
		}

		if count != 0 {
			t.Errorf("expected 0 api keys after cascade delete, got %d", count)
		}
	})
}
