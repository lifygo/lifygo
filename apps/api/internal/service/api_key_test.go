package service_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/service"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
)

// -----------------------------------------------------------------------
// Fake APIKeyRepository
// -----------------------------------------------------------------------

// fakeAPIKeyRepository is an in-memory implementation of service.APIKeyRepository.
type fakeAPIKeyRepository struct {
	keys          map[string]*model.APIKey // keyed by ID
	byHash        map[string]*model.APIKey // keyed by KeyHash
	lastUsedCalls []string                 // records IDs passed to UpdateLastUsedAt
	createErr     error
	getByHashErr  error
	deleteErr     error
}

func newFakeAPIKeyRepository() *fakeAPIKeyRepository {
	return &fakeAPIKeyRepository{
		keys:   make(map[string]*model.APIKey),
		byHash: make(map[string]*model.APIKey),
	}
}

func (f *fakeAPIKeyRepository) Create(_ context.Context, userID, keyHash, name string) (*model.APIKey, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	if _, exists := f.byHash[keyHash]; exists {
		return nil, model.ErrAlreadyExists
	}
	key := &model.APIKey{
		ID:        "key_" + keyHash[:8],
		UserID:    userID,
		KeyHash:   keyHash,
		Name:      name,
		CreatedAt: time.Now(),
	}
	f.keys[key.ID] = key
	f.byHash[keyHash] = key
	return key, nil
}

func (f *fakeAPIKeyRepository) GetByHash(_ context.Context, keyHash string) (*model.APIKey, error) {
	if f.getByHashErr != nil {
		return nil, f.getByHashErr
	}
	key, ok := f.byHash[keyHash]
	if !ok {
		return nil, model.ErrNotFound
	}
	return key, nil
}

func (f *fakeAPIKeyRepository) ListByUserID(_ context.Context, userID string) ([]model.APIKey, error) {
	result := make([]model.APIKey, 0)
	for _, key := range f.keys {
		if key.UserID == userID {
			result = append(result, *key)
		}
	}
	return result, nil
}

func (f *fakeAPIKeyRepository) CountByUserID(_ context.Context, userID string) (int, error) {
	count := 0
	for _, key := range f.keys {
		if key.UserID == userID {
			count++
		}
	}
	return count, nil
}

func (f *fakeAPIKeyRepository) UpdateLastUsedAt(_ context.Context, id string) error {
	f.lastUsedCalls = append(f.lastUsedCalls, id)
	if key, ok := f.keys[id]; ok {
		now := time.Now()
		key.LastUsedAt = &now
	}
	return nil
}

func (f *fakeAPIKeyRepository) Delete(_ context.Context, id, userID string) error {
	if f.deleteErr != nil {
		return f.deleteErr
	}
	key, ok := f.keys[id]
	if !ok || key.UserID != userID {
		return model.ErrNotFound
	}
	delete(f.byHash, key.KeyHash)
	delete(f.keys, id)
	return nil
}

// -----------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------

func TestAPIKeyService_Create(t *testing.T) {
	t.Parallel()

	t.Run("creates a key successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "production",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.ID == "" {
			t.Error("expected ID to be set")
		}
		if resp.Name != "production" {
			t.Errorf("Name: got %q want production", resp.Name)
		}
		if resp.RawKey == "" {
			t.Error("expected RawKey to be set")
		}
		if !strings.HasPrefix(resp.RawKey, "lfy_") {
			t.Errorf("RawKey must start with lfy_, got %q", resp.RawKey)
		}
		if resp.LastUsedAt != nil {
			t.Error("expected LastUsedAt to be nil for a brand new key")
		}
	})

	t.Run("raw key is not stored — only the hash is", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "test",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Look up the stored key by hashing the raw key ourselves.
		expectedHash, err := crypto.HashAPIKey(resp.RawKey)
		if err != nil {
			t.Fatalf("failed to hash raw key: %v", err)
		}

		stored, ok := repo.byHash[expectedHash]
		if !ok {
			t.Fatal("expected to find the stored key by its hash, but got nothing")
		}

		// The raw key must never appear in what was stored.
		if stored.KeyHash == resp.RawKey {
			t.Error("the raw key must not be stored — only its hash should be")
		}
	})

	t.Run("enforces maximum key limit of 5", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		// Create 5 keys — all should succeed.
		for i := 0; i < 5; i++ {
			_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
				UserID: "user_1",
				Name:   "key",
			})
			if err != nil {
				t.Fatalf("key %d creation failed unexpectedly: %v", i+1, err)
			}
		}

		// The 6th key must be rejected.
		_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "one-too-many",
		})
		if !errors.Is(err, model.ErrAPIKeyLimitReached) {
			t.Errorf("got %v, want %v", err, model.ErrAPIKeyLimitReached)
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			Name: "production",
		})
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns error for missing key name", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
		})
		if !errors.Is(err, model.ErrAPIKeyNameRequired) {
			t.Errorf("got %v, want %v", err, model.ErrAPIKeyNameRequired)
		}
	})

	t.Run("different users have separate key limits", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		// Fill userA to the limit.
		for i := 0; i < 5; i++ {
			_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
				UserID: "user_a",
				Name:   "key",
			})
			if err != nil {
				t.Fatalf("userA key %d failed: %v", i+1, err)
			}
		}

		// userB should still be able to create keys.
		_, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_b",
			Name:   "first-key",
		})
		if err != nil {
			t.Errorf("userB should be able to create a key but got: %v", err)
		}
	})
}

// -----------------------------------------------------------------------
// Authenticate
// -----------------------------------------------------------------------

func TestAPIKeyService_Authenticate(t *testing.T) {
	t.Parallel()

	t.Run("authenticates a valid key", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		// Create a key through the service so we have a real raw key.
		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "test",
		})
		if err != nil {
			t.Fatalf("failed to create key: %v", err)
		}

		// Authenticate with the raw key.
		key, err := svc.Authenticate(context.Background(), resp.RawKey)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if key.UserID != "user_1" {
			t.Errorf("UserID: got %q want user_1", key.UserID)
		}
	})

	t.Run("returns ErrUnauthorized for an unknown key", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		_, err := svc.Authenticate(context.Background(), "lfy_doesnotexist")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns ErrUnauthorized for an empty key", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		_, err := svc.Authenticate(context.Background(), "")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("does not authenticate with a wrong key that looks similar", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "test",
		})
		if err != nil {
			t.Fatalf("failed to create key: %v", err)
		}

		// Change the last character of the raw key.
		tampered := resp.RawKey[:len(resp.RawKey)-1] + "X"

		_, err = svc.Authenticate(context.Background(), tampered)
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}

// -----------------------------------------------------------------------
// List
// -----------------------------------------------------------------------

func TestAPIKeyService_List(t *testing.T) {
	t.Parallel()

	t.Run("returns all keys for a user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		svc.Create(context.Background(), model.CreateAPIKeyInput{UserID: "user_1", Name: "key-one"})
		svc.Create(context.Background(), model.CreateAPIKeyInput{UserID: "user_1", Name: "key-two"})

		keys, err := svc.List(context.Background(), "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(keys) != 2 {
			t.Errorf("expected 2 keys, got %d", len(keys))
		}
	})

	t.Run("returns empty list for user with no keys", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		keys, err := svc.List(context.Background(), "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(keys) != 0 {
			t.Errorf("expected 0 keys, got %d", len(keys))
		}
	})

	t.Run("returns ErrUnauthorized for empty user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		_, err := svc.List(context.Background(), "")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestAPIKeyService_Delete(t *testing.T) {
	t.Parallel()

	t.Run("deletes a key owned by the user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "test",
		})
		if err != nil {
			t.Fatalf("failed to create key: %v", err)
		}

		if err := svc.Delete(context.Background(), resp.ID, "user_1"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// After deletion, the key must not authenticate.
		_, err = svc.Authenticate(context.Background(), resp.RawKey)
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v after deletion", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns ErrNotFound when deleting a key that belongs to another user", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		resp, err := svc.Create(context.Background(), model.CreateAPIKeyInput{
			UserID: "user_1",
			Name:   "test",
		})
		if err != nil {
			t.Fatalf("failed to create key: %v", err)
		}

		err = svc.Delete(context.Background(), resp.ID, "user_2")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for empty id or user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeAPIKeyRepository()
		svc := service.NewAPIKeyService(repo)

		if err := svc.Delete(context.Background(), "", "user_1"); !errors.Is(err, model.ErrNotFound) {
			t.Errorf("empty id: got %v, want %v", err, model.ErrNotFound)
		}

		if err := svc.Delete(context.Background(), "key_1", ""); !errors.Is(err, model.ErrNotFound) {
			t.Errorf("empty userID: got %v, want %v", err, model.ErrNotFound)
		}
	})
}
