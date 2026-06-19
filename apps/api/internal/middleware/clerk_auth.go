package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// ClerkUserResolver maps a Clerk user ID to our internal user record.
// Implemented by UserService.GetByClerkUserID.
type ClerkUserResolver interface {
	GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error)
}

// FlexibleAuth accepts EITHER an X-API-Key header OR a Clerk session
// token (Authorization: Bearer <token>). Both resolve to the same
// internal userID stored in context.
//
//   - X-API-Key    → used by external developers calling the public API
//   - Bearer token → used by our own Next.js dashboard (Clerk session)
func FlexibleAuth(apiAuth APIKeyAuthenticator, clerkUsers ClerkUserResolver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Try X-API-Key first — this is the common case for the public API.
			if rawKey := r.Header.Get("X-API-Key"); rawKey != "" {
				key, err := apiAuth.Authenticate(r.Context(), rawKey)
				if err != nil {
					writeError(w, http.StatusUnauthorized, "invalid api key")
					return
				}
				ctx := context.WithValue(r.Context(), userIDKey, key.UserID)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			// Fall back to a Clerk session token from the dashboard.
			authHeader := r.Header.Get("Authorization")
			token := strings.TrimPrefix(authHeader, "Bearer ")
			if token == "" || token == authHeader {
				writeError(w, http.StatusUnauthorized, "missing credentials")
				return
			}

			claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{Token: token})
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid session")
				return
			}

			user, err := clerkUsers.GetByClerkUserID(r.Context(), claims.Subject)
			if err != nil {
				writeError(w, http.StatusUnauthorized, "user not found")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, user.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
