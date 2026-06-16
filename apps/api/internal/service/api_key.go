package service

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
)

// maxAPIKeysPerUser is the maximum number of API keys a single user
// can have at any one time. Enforced on every Create call.
// This limit applies to all users on the free tier.
const maxAPIKeysPerUser = 5

// APIKeyRepository defines the database operations the APIKeyService needs.
type APIKeyRepository interface {
	Create(ctx context.Context, userID, keyHash, name string) (*model.APIKey, error)
	GetByHash(ctx context.Context, keyHash string) (*model.APIKey, error)
	ListByUserID(ctx context.Context, userID string) ([]model.APIKey, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
	UpdateLastUsedAt(ctx context.Context, id string) error
	Delete(ctx context.Context, id, userID string) error
}

// APIKeyService handles all business logic related to API keys.
type APIKeyService struct {
	keys APIKeyRepository
}

// NewAPIKeyService creates a new APIKeyService.
func NewAPIKeyService(keys APIKeyRepository) *APIKeyService {
	return &APIKeyService{keys: keys}
}

// Create generates a new API key for the given user.
//
// What happens here:
//  1. Check the user has not hit the key limit.
//  2. Generate a cryptographically secure random key (lfy_<64 hex chars>).
//  3. Hash the raw key with SHA-256.
//  4. Store only the hash in the database — never the raw key.
//  5. Return the raw key inside APIKeyResponse — this is the ONLY time
//     the raw key is ever visible. Once this response is sent, it is gone.
//
// The caller must show the raw key to the user immediately and make
// clear it cannot be recovered later.
func (s *APIKeyService) Create(ctx context.Context, input model.CreateAPIKeyInput) (*model.APIKeyResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	// Enforce the per-user key limit before creating a new key.
	count, err := s.keys.CountByUserID(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to count api keys: %w", err)
	}
	if count >= maxAPIKeysPerUser {
		return nil, model.ErrAPIKeyLimitReached
	}

	// Generate a secure random raw key.
	rawKey, err := crypto.GenerateAPIKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate api key: %w", err)
	}

	// Hash the raw key — only the hash is stored.
	keyHash, err := crypto.HashAPIKey(rawKey)
	if err != nil {
		return nil, fmt.Errorf("failed to hash api key: %w", err)
	}

	// Store the hashed key in the database.
	key, err := s.keys.Create(ctx, input.UserID, keyHash, input.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to store api key: %w", err)
	}

	// Return the raw key in the response — shown to the user once only.
	return &model.APIKeyResponse{
		ID:         key.ID,
		Name:       key.Name,
		RawKey:     rawKey,
		LastUsedAt: key.LastUsedAt,
		CreatedAt:  key.CreatedAt,
	}, nil
}

// Authenticate validates an incoming raw API key from an X-API-Key header.
// It hashes the raw key, looks it up in the database, updates last_used_at,
// and returns the full APIKey record so the caller can get the user ID.
// Returns model.ErrNotFound if the key does not exist.
func (s *APIKeyService) Authenticate(ctx context.Context, rawKey string) (*model.APIKey, error) {
	if rawKey == "" {
		return nil, model.ErrUnauthorized
	}

	// Hash the incoming key to look it up in the database.
	keyHash, err := crypto.HashAPIKey(rawKey)
	if err != nil {
		return nil, fmt.Errorf("failed to hash api key: %w", err)
	}

	key, err := s.keys.GetByHash(ctx, keyHash)
	if err != nil {
		// Return ErrUnauthorized rather than ErrNotFound so we do not
		// leak whether a key exists or not to the caller.
		if err == model.ErrNotFound {
			return nil, model.ErrUnauthorized
		}
		return nil, fmt.Errorf("failed to look up api key: %w", err)
	}

	// Update last_used_at in the background. We do not wait for this
	// to finish — the request should not be slowed down by a metadata update.
	// If this fails, it is not critical — the key still works.
	go func() {
		_ = s.keys.UpdateLastUsedAt(context.Background(), key.ID)
	}()

	return key, nil
}

// List returns all API keys belonging to a user.
// The key hash is never returned to the caller — it is excluded
// by the json:"-" tag on the model.
func (s *APIKeyService) List(ctx context.Context, userID string) ([]model.APIKey, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	keys, err := s.keys.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list api keys: %w", err)
	}

	return keys, nil
}

// Delete removes an API key by ID.
// userID is required to confirm ownership — a user cannot delete
// another user's key even if they know the ID.
func (s *APIKeyService) Delete(ctx context.Context, id, userID string) error {
	if id == "" || userID == "" {
		return model.ErrNotFound
	}

	if err := s.keys.Delete(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to delete api key: %w", err)
	}

	return nil
}
