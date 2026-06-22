package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// RateLimitStore defines the Redis operations the rate limit middleware needs.
type RateLimitStore interface {
	Increment(ctx context.Context, key string) (int64, error)
	ExpireIfNotSet(ctx context.Context, key string, ttl time.Duration) error
}

// rateLimitWindow is the time window for the rate limit counter.
// The counter resets after this duration.
const rateLimitWindow = 1 * time.Hour

// RateLimit returns an HTTP middleware that enforces a maximum number
// of requests per API key per hour using Redis counters.
//
// How it works:
//  1. Build a Redis key from the user ID and the current hour.
//  2. Increment the counter for that key.
//  3. On the first request of the hour, set a TTL of 1 hour on the key.
//     This means the counter resets automatically after the window ends.
//  4. If the counter exceeds the limit, return 429 Too Many Requests.
//
// The window is fixed (not sliding) — it resets at the top of each hour.
// This is intentional: it is simpler, cheaper, and sufficient for our use case.
func RateLimit(store RateLimitStore, maxRequests int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := UserIDFromContext(r.Context())
			if userID == "" {
				// No user ID means the request was not authenticated.
				// Let the auth middleware handle this — do not rate limit here.
				next.ServeHTTP(w, r)
				return
			}

			// Only rate limit write operations.
			// Read requests (GET) are cheap and do not need throttling.
			if r.Method == http.MethodGet {
				next.ServeHTTP(w, r)
				return
			}

			key := rateLimitKey(userID)

			// Increment the counter for this user in this hour.
			count, err := store.Increment(r.Context(), key)

			if err != nil {
				// If Redis is unavailable, fail open — let the request through.
				// We prefer availability over strict rate limiting when Redis is down.
				next.ServeHTTP(w, r)
				return
			}

			// On the first request of the window, set the expiry.
			// We do this after incrementing so the key definitely exists.
			if err := store.ExpireIfNotSet(r.Context(), key, rateLimitWindow); err != nil {
				// Non-fatal — the counter works even without the expiry.
				// The window will not reset automatically, but that is
				// better than dropping the request.
				_ = err
			}

			// Reject if the counter exceeds the limit.
			if count > maxRequests {
				w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
				w.Header().Set("X-RateLimit-Remaining", "0")
				writeError(w, http.StatusTooManyRequests, "rate limit exceeded")
				return
			}

			// Set informational headers so the client knows how many
			// requests they have left in the current window.
			remaining := maxRequests - count
			if remaining < 0 {
				remaining = 0
			}
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

			next.ServeHTTP(w, r)
		})
	}
}

// rateLimitKey builds the Redis key for a user's rate limit counter.
// The key includes the current hour so it resets automatically each hour
// without needing a background job to clear old counters.
// Format: "ratelimit:<userID>:<YYYY-MM-DD-HH>"
func rateLimitKey(userID string) string {
	hour := time.Now().UTC().Format("2006-01-02-15")
	return fmt.Sprintf("ratelimit:%s:%s", userID, hour)
}
