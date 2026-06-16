package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
)

// contextKey is an unexported type used for context keys in this package.
// Using a custom type prevents collisions with context keys from other packages.
type contextKey string

const requestIDKey contextKey = "request_id"

// RequestID returns an HTTP middleware that assigns a unique ID to every
// incoming request and stores it in the request context.
//
// The request ID is:
//   - Read from the "X-Request-ID" header if the caller provided one.
//   - Generated as a 16-byte random hex string if not provided.
//
// The ID is also written back to the response as "X-Request-ID" so the
// caller can use it to trace a specific request through logs.
func RequestID() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			id := r.Header.Get("X-Request-ID")
			if id == "" {
				id = generateRequestID()
			}

			// Store in context so handlers and other middleware can read it.
			ctx := context.WithValue(r.Context(), requestIDKey, id)

			// Echo it back in the response for client-side tracing.
			w.Header().Set("X-Request-ID", id)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequestIDFromContext retrieves the request ID from a context.
// Returns an empty string if no request ID was set.
func RequestIDFromContext(ctx context.Context) string {
	id, _ := ctx.Value(requestIDKey).(string)
	return id
}

// generateRequestID creates a cryptographically random 16-byte hex string.
// Format: "a3f8c2d1e4b5a6f7c8d9e0f1a2b3c4d5"
func generateRequestID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback — should never happen on a healthy system.
		return "fallback-request-id"
	}
	return hex.EncodeToString(bytes)
}
