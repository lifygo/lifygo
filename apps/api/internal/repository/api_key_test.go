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

func TestAPIKeyRepository_Create(t *testing.T) {
	pool := newTestPool(t)

	t.Run("creates a new api key successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		key, err := repo.Create(context.Background(), user.ID, "hash_"+randomSuffix(), "production")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if key.ID == "" {
			t.Error("expected key.ID to be set, got empty string")
		}
		if key.UserID != user.ID {
			t.Errorf("UserID: got %q want %q", key.UserID, user.ID)
		}
		if key.Name != "production" {
			t.Errorf("Name: got %q want %q", key.Name, "production")
		}
		if key.LastUsedAt != nil {
			t.Errorf("LastUsedAt: got %v, want nil for a brand new key", key.LastUsedAt)
		}
		if key.CreatedAt.IsZero() {
			t.Error("expected key.CreatedAt to be set, got zero time")
		}
	})

	t.Run("allows the same user to have multiple keys", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		_, err := repo.Create(context.Background(), user.ID, "hash_"+randomSuffix(), "key-one")
		if err != nil {
			t.Fatalf("first create failed unexpectedly: %v", err)
		}

		_, err = repo.Create(context.Background(), user.ID, "hash_"+randomSuffix(), "key-two")
		if err != nil {
			t.Fatalf("second create failed unexpectedly: %v", err)
		}

		count, err := repo.CountByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error counting keys: %v", err)
		}
		if count != 2 {
			t.Errorf("CountByUserID: got %d want 2", count)
		}
	})

	t.Run("rejects duplicate key hash", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		sameHash := "hash_" + randomSuffix()

		_, err := repo.Create(context.Background(), user.ID, sameHash, "key-one")
		if err != nil {
			t.Fatalf("first create failed unexpectedly: %v", err)
		}

		_, err = repo.Create(context.Background(), user.ID, sameHash, "key-two")
		if !errors.Is(err, model.ErrAlreadyExists) {
			t.Errorf("got error %v, want %v", err, model.ErrAlreadyExists)
		}
	})

	t.Run("rejects api key for a user that does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewAPIKeyRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		// user_id has a foreign key to users(id). A non-existent user
		// must cause a database error, not a silent success.
		_, err := repo.Create(context.Background(), randomUUID, "hash_"+randomSuffix(), "orphan-key")
		if err == nil {
			t.Error("expected an error for non-existent user_id, got nil")
		}
	})
}

// -----------------------------------------------------------------------
// GetByHash
// -----------------------------------------------------------------------

func TestAPIKeyRepository_GetByHash(t *testing.T) {
	pool := newTestPool(t)

	t.Run("finds an existing key by its hash", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestAPIKey(t, tx, user.ID)
		repo := repository.NewAPIKeyRepository(tx)

		found, err := repo.GetByHash(context.Background(), created.KeyHash)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if found.ID != created.ID {
			t.Errorf("ID: got %q want %q", found.ID, created.ID)
		}
		if found.UserID != user.ID {
			t.Errorf("UserID: got %q want %q", found.UserID, user.ID)
		}
	})

	t.Run("returns ErrNotFound for an unknown hash", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewAPIKeyRepository(tx)

		_, err := repo.GetByHash(context.Background(), "hash_does_not_exist_"+randomSuffix())
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// ListByUserID
// -----------------------------------------------------------------------

func TestAPIKeyRepository_ListByUserID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("returns all keys for a user, newest first", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		first, err := repo.Create(context.Background(), user.ID, "hash_"+randomSuffix(), "first-key")
		if err != nil {
			t.Fatalf("failed to create first key: %v", err)
		}

		second, err := repo.Create(context.Background(), user.ID, "hash_"+randomSuffix(), "second-key")
		if err != nil {
			t.Fatalf("failed to create second key: %v", err)
		}

		keys, err := repo.ListByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(keys) != 2 {
			t.Fatalf("expected 2 keys, got %d", len(keys))
		}

		// "second" was created after "first", so it should come first
		// in the list (newest first).
		if keys[0].ID != second.ID {
			t.Errorf("keys[0].ID: got %q want %q (the newest key)", keys[0].ID, second.ID)
		}
		if keys[1].ID != first.ID {
			t.Errorf("keys[1].ID: got %q want %q (the oldest key)", keys[1].ID, first.ID)
		}
	})

	t.Run("returns an empty list for a user with no keys", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		keys, err := repo.ListByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(keys) != 0 {
			t.Errorf("expected 0 keys, got %d", len(keys))
		}
	})

	t.Run("does not return keys belonging to other users", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		insertTestAPIKey(t, tx, userA.ID)
		insertTestAPIKey(t, tx, userB.ID)

		keysA, err := repo.ListByUserID(context.Background(), userA.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(keysA) != 1 {
			t.Fatalf("expected 1 key for userA, got %d", len(keysA))
		}
		if keysA[0].UserID != userA.ID {
			t.Errorf("key belongs to %q, want %q", keysA[0].UserID, userA.ID)
		}
	})
}

// -----------------------------------------------------------------------
// CountByUserID
// -----------------------------------------------------------------------

func TestAPIKeyRepository_CountByUserID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("counts zero for a new user", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		count, err := repo.CountByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if count != 0 {
			t.Errorf("got %d want 0", count)
		}
	})

	t.Run("counts correctly after creating keys", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		insertTestAPIKey(t, tx, user.ID)
		insertTestAPIKey(t, tx, user.ID)
		insertTestAPIKey(t, tx, user.ID)

		count, err := repo.CountByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if count != 3 {
			t.Errorf("got %d want 3", count)
		}
	})
}

// -----------------------------------------------------------------------
// UpdateLastUsedAt
// -----------------------------------------------------------------------

func TestAPIKeyRepository_UpdateLastUsedAt(t *testing.T) {
	pool := newTestPool(t)

	t.Run("sets last_used_at on an existing key", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestAPIKey(t, tx, user.ID)
		repo := repository.NewAPIKeyRepository(tx)

		// Brand new keys start with no last_used_at.
		if created.LastUsedAt != nil {
			t.Fatalf("expected LastUsedAt to be nil before update, got %v", created.LastUsedAt)
		}

		if err := repo.UpdateLastUsedAt(context.Background(), created.ID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, err := repo.GetByHash(context.Background(), created.KeyHash)
		if err != nil {
			t.Fatalf("unexpected error fetching updated key: %v", err)
		}

		if found.LastUsedAt == nil {
			t.Error("expected LastUsedAt to be set after update, got nil")
		}
	})

	t.Run("returns ErrNotFound for a key that does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewAPIKeyRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		err := repo.UpdateLastUsedAt(context.Background(), randomUUID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestAPIKeyRepository_Delete(t *testing.T) {
	pool := newTestPool(t)

	t.Run("deletes a key owned by the user", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestAPIKey(t, tx, user.ID)
		repo := repository.NewAPIKeyRepository(tx)

		if err := repo.Delete(context.Background(), created.ID, user.ID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		_, err := repo.GetByHash(context.Background(), created.KeyHash)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound when key does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		err := repo.Delete(context.Background(), randomUUID, user.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound when key belongs to a different user", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewAPIKeyRepository(tx)

		// The key belongs to userA.
		created := insertTestAPIKey(t, tx, userA.ID)

		// userB tries to delete userA's key — this must fail.
		err := repo.Delete(context.Background(), created.ID, userB.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}

		// And the key should still exist for userA.
		_, err = repo.GetByHash(context.Background(), created.KeyHash)
		if err != nil {
			t.Errorf("key should still exist after failed delete attempt, got error: %v", err)
		}
	})
}
