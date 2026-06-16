package middleware

import (
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
)

// Recovery returns an HTTP middleware that catches any panic that occurs
// in a downstream handler and recovers gracefully.
//
// Without this middleware, a panic in any handler would crash the entire
// server process. With it, panics are caught, logged with a full stack
// trace, and the client receives a 500 Internal Server Error instead.
//
// This should always be the outermost middleware in the chain —
// registered first so it wraps everything else.
func Recovery() func(http.Handler) http.Handler {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelError,
	}))

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Log the panic with a full stack trace so we can debug it.
					logger.Error("panic recovered",
						slog.Any("error", err),
						slog.String("stack", string(debug.Stack())),
						slog.String("method", r.Method),
						slog.String("path", r.URL.Path),
						slog.String("request_id", RequestIDFromContext(r.Context())),
					)

					// Respond with 500 — do not leak any panic details to the client.
					http.Error(w, "internal server error", http.StatusInternalServerError)
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
