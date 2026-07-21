package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

type ClerkUserResolver interface {
	GetByClerkUserID(ctx context.Context, clerkUserID string) (*model.User, error)
}

type LocalUserResolver interface {
	ValidateToken(ctx context.Context, tokenString string) (*model.User, error)
}

func FlexibleAuth(apiAuth APIKeyAuthenticator, clerkUsers ClerkUserResolver, localUsers LocalUserResolver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

			token := extractToken(r)
			if token == "" {
				writeError(w, http.StatusUnauthorized, "missing credentials")
				return
			}

			if localUsers != nil {
				user, err := localUsers.ValidateToken(r.Context(), token)
				if err == nil {
					ctx := context.WithValue(r.Context(), userIDKey, user.ID)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}

			if clerkUsers != nil {
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
				return
			}

			writeError(w, http.StatusUnauthorized, "invalid session")
		})
	}
}

func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if token := strings.TrimPrefix(authHeader, "Bearer "); token != "" && token != authHeader {
		return token
	}

	cookie, err := r.Cookie("lifygo_token")
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}

	return ""
}
