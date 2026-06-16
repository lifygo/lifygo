package middleware

import (
	"log/slog"
	"net/http"
	"os"
	"time"
)

// responseWriter wraps http.ResponseWriter so we can capture the
// status code written by the handler. The standard http.ResponseWriter
// does not expose the status code after it has been written.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	written    bool
}

// newResponseWriter wraps an http.ResponseWriter with status tracking.
// The default status code is 200 because if a handler writes a body
// without calling WriteHeader, Go implicitly uses 200.
func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
}

// WriteHeader captures the status code before passing it through.
func (rw *responseWriter) WriteHeader(code int) {
	if !rw.written {
		rw.statusCode = code
		rw.written = true
		rw.ResponseWriter.WriteHeader(code)
	}
}

// Logger returns an HTTP middleware that logs every request as a
// single structured JSON log line when the request completes.
//
// Each log line includes:
//   - method     — HTTP method (GET, POST, etc.)
//   - path       — request path
//   - status     — HTTP response status code
//   - duration   — how long the request took in milliseconds
//   - request_id — unique ID per request (from RequestID middleware)
//
// Uses log/slog (standard library since Go 1.21) for structured
// JSON output. No third-party logging library needed.
func Logger() func(http.Handler) http.Handler {
	// Build a JSON logger that writes to stdout.
	// In production, stdout is captured by the container runtime
	// (Docker, systemd) and forwarded to a log aggregator.
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Wrap the response writer so we can capture the status code.
			wrapped := newResponseWriter(w)

			// Pass control to the next handler in the chain.
			next.ServeHTTP(wrapped, r)

			duration := time.Since(start).Milliseconds()

			logger.Info("request",
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", wrapped.statusCode),
				slog.Int64("duration_ms", duration),
				slog.String("request_id", RequestIDFromContext(r.Context())),
			)
		})
	}
}
