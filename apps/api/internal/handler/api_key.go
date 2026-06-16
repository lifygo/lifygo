package handler

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// APIKeyServicer defines the operations the api key handler needs.
type APIKeyServicer interface {
	Create(ctx context.Context, input model.CreateAPIKeyInput) (*model.APIKeyResponse, error)
	List(ctx context.Context, userID string) ([]model.APIKey, error)
	Delete(ctx context.Context, id, userID string) error
}

// APIKeyHandler handles HTTP requests related to API keys.
type APIKeyHandler struct {
	keys APIKeyServicer
}

// NewAPIKeyHandler creates a new APIKeyHandler.
func NewAPIKeyHandler(keys APIKeyServicer) *APIKeyHandler {
	return &APIKeyHandler{keys: keys}
}

// createAPIKeyRequest is the shape of the POST /api-keys request body.
type createAPIKeyRequest struct {
	Name string `json:"name"`
}

// Create handles POST /api-keys.
// Generates a new API key for the authenticated user.
// The raw key is returned once in the response and never again.
func (h *APIKeyHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createAPIKeyRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.keys.Create(r.Context(), model.CreateAPIKeyInput{
		UserID: userID,
		Name:   req.Name,
	})
	if err != nil {
		switch err {
		case model.ErrAPIKeyNameRequired:
			respondError(w, http.StatusBadRequest, "key name is required")
		case model.ErrAPIKeyLimitReached:
			respondError(w, http.StatusUnprocessableEntity, "api key limit reached")
		default:
			respondError(w, http.StatusInternalServerError, "failed to create api key")
		}
		return
	}

	respond(w, http.StatusCreated, resp)
}

// List handles GET /api-keys.
// Returns all API keys for the authenticated user.
// The key hash is never included in the response.
func (h *APIKeyHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	keys, err := h.keys.List(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list api keys")
		return
	}

	respond(w, http.StatusOK, keys)
}

// Delete handles DELETE /api-keys/{id}.
// Removes an API key owned by the authenticated user.
func (h *APIKeyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "key id is required")
		return
	}

	if err := h.keys.Delete(r.Context(), id, userID); err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "api key not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to delete api key")
		return
	}

	respond(w, http.StatusOK, map[string]string{"message": "api key deleted"})
}
