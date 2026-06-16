package handler

import (
	"context"
	"net/http"
	"time"
)

// HealthChecker defines the health check operations the health handler needs.
// Both the database pool and Redis client implement this interface.
type HealthChecker interface {
	Health(ctx context.Context) error
}

// HealthResponse is the shape returned by GET /health.
type HealthResponse struct {
	// Status is "ok" if all checks pass, "degraded" if any check fails.
	Status string `json:"status"`

	// Services holds the status of each individual dependency.
	Services map[string]string `json:"services"`

	// Timestamp is the time this health check was performed.
	Timestamp time.Time `json:"timestamp"`
}

// HealthHandler handles GET /health.
// Returns the health status of the API and its dependencies.
// Used by Docker health checks, load balancers, and monitoring tools.
type HealthHandler struct {
	db    HealthChecker
	redis HealthChecker
}

// NewHealthHandler creates a new HealthHandler.
func NewHealthHandler(db, redis HealthChecker) *HealthHandler {
	return &HealthHandler{db: db, redis: redis}
}

// Health handles GET /health.
// Returns 200 if all dependencies are healthy.
// Returns 503 if any dependency is unhealthy.
func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	services := make(map[string]string)
	allHealthy := true

	// Check PostgreSQL.
	if err := h.db.Health(ctx); err != nil {
		services["postgres"] = "unhealthy: " + err.Error()
		allHealthy = false
	} else {
		services["postgres"] = "healthy"
	}

	// Check Redis.
	if err := h.redis.Health(ctx); err != nil {
		services["redis"] = "unhealthy: " + err.Error()
		allHealthy = false
	} else {
		services["redis"] = "healthy"
	}

	status := "ok"
	httpStatus := http.StatusOK
	if !allHealthy {
		status = "degraded"
		httpStatus = http.StatusServiceUnavailable
	}

	respond(w, httpStatus, HealthResponse{
		Status:    status,
		Services:  services,
		Timestamp: time.Now().UTC(),
	})
}
