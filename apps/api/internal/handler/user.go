package handler

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	svix "github.com/svix/svix-webhooks/go"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// UserServicer defines the operations the user handler needs.
type UserServicer interface {
	CreateFromClerk(ctx context.Context, input model.CreateUserInput) (*model.User, error)
	Delete(ctx context.Context, id string) error
}

// UserHandler handles HTTP requests related to users.
type UserHandler struct {
	users         UserServicer
	webhookSecret string
}

// NewUserHandler creates a new UserHandler.
// webhookSecret is the Clerk webhook signing secret (starts with whsec_),
// used to verify that incoming webhook requests genuinely came from Clerk.
func NewUserHandler(users UserServicer, webhookSecret string) *UserHandler {
	return &UserHandler{users: users, webhookSecret: webhookSecret}
}

// clerkWebhookPayload is the shape of the Clerk "user.created" webhook body.
// Clerk sends this JSON when a new user signs up via Google or GitHub OAuth.
type clerkWebhookPayload struct {
	Type string `json:"type"`
	Data struct {
		ID             string `json:"id"`
		FirstName      string `json:"first_name"`
		LastName       string `json:"last_name"`
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
	} `json:"data"`
}

// ClerkWebhook handles POST /webhooks/clerk.
// Called by Clerk when a user signs in for the first time.
// Creates the user in our database and links them to their Clerk identity.
//
// Security note: In production, Clerk webhook payloads must be verified
// using the Clerk webhook signing secret. That verification is handled
// by a separate Clerk middleware (to be added in Phase 4 when we harden
// the webhook endpoint before going live).
func (h *UserHandler) ClerkWebhook(w http.ResponseWriter, r *http.Request) {
	// Read the raw request body. We need the exact raw bytes (not a
	// decoded struct) because signature verification checks the bytes
	// exactly as Clerk sent them.
	body, err := io.ReadAll(r.Body)
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to read request body")
		return
	}

	// Verify this request genuinely came from Clerk using the svix
	// signing headers Clerk attaches to every webhook delivery.
	// This stops anyone else from POSTing fake user data to this endpoint.
	wh, err := svix.NewWebhook(h.webhookSecret)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "webhook not configured correctly")
		return
	}

	if err := wh.Verify(body, r.Header); err != nil {
		respondError(w, http.StatusUnauthorized, "invalid webhook signature")
		return
	}

	// Now that the signature is verified, it is safe to parse the payload.
	var payload clerkWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// We only handle "user.created" events.
	// Other event types (user.updated, user.deleted) are ignored for now.
	if payload.Type != "user.created" {
		respond(w, http.StatusOK, map[string]string{"message": "event ignored"})
		return
	}

	if len(payload.Data.EmailAddresses) == 0 {
		respondError(w, http.StatusBadRequest, "no email address in webhook payload")
		return
	}

	name := payload.Data.FirstName + " " + payload.Data.LastName
	email := payload.Data.EmailAddresses[0].EmailAddress

	_, err = h.users.CreateFromClerk(r.Context(), model.CreateUserInput{
		ClerkUserID: payload.Data.ID,
		Name:        name,
		Email:       email,
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	respond(w, http.StatusOK, map[string]string{"message": "user created"})
}

// DeleteAccount handles DELETE /account.
// Deletes the authenticated user's account and all of their data.
// Requires a valid X-API-Key header.
func (h *UserHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if err := h.users.Delete(r.Context(), userID); err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "user not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to delete account")
		return
	}

	respond(w, http.StatusOK, map[string]string{"message": "account deleted"})
}
