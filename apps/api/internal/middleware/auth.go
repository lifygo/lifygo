package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// userIDKey is the context key used to store the authenticated user ID.
// Handlers read this after the auth middleware runs.
const userIDKey contextKey = "user_id"

// APIKeyAuthenticator defines the single method the auth middleware
// needs from the API key service. Using an interface here means we
// can swap in a fake during tests without a real database.
type APIKeyAuthenticator interface {
	Authenticate(ctx context.Context, rawKey string) (*model.APIKey, error)
}

// APIKeyAuth returns an HTTP middleware that authenticates requests
// using the X-API-Key header.
//
// What it does:
//  1. Reads the raw API key from the X-API-Key header.
//  2. Calls Authenticate — which hashes the key and looks it up in the DB.
//  3. If valid, stores the user ID in the request context and calls next.
//  4. If invalid or missing, returns 401 Unauthorized immediately.
//
// After this middleware runs, handlers can call UserIDFromContext to
// get the authenticated user's ID without touching the database again.
func APIKeyAuth(authenticator APIKeyAuthenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			rawKey := r.Header.Get("X-API-Key")
			if rawKey == "" {
				writeError(w, http.StatusUnauthorized, "missing api key")
				return
			}

			key, err := authenticator.Authenticate(r.Context(), rawKey)
			if err != nil {
				// Do not reveal whether the key exists or not.
				// Always return the same message for any auth failure.
				writeError(w, http.StatusUnauthorized, "invalid api key")
				return
			}

			// Store the authenticated user ID in the context.
			// Downstream handlers use UserIDFromContext to retrieve it.
			ctx := context.WithValue(r.Context(), userIDKey, key.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserIDFromContext retrieves the authenticated user ID from a context.
// Returns an empty string if no user ID was set — which means the
// request was not authenticated.
// Handlers should always check that this is non-empty before proceeding.
func UserIDFromContext(ctx context.Context) string {
	id, _ := ctx.Value(userIDKey).(string)
	return id
}

// writeError writes a JSON error response with the given status code
// and message. Used by middleware to return consistent error shapes
// that match what the handlers return.
func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	// Write a minimal JSON error body without importing encoding/json.
	// This keeps the middleware package dependency-free.
	msg := strings.ReplaceAll(message, `"`, `\"`)
	w.Write([]byte(`{"error":"` + msg + `"}`))
}
