package handler

import (
	"context"
	"net/http"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// DashboardStatsProvider defines what the dashboard handler needs
// from each service to build the overview stats.
type DashboardStatsProvider interface {
	GetDashboardStats(ctx context.Context, userID string) (*model.DashboardStats, error)
}

// DashboardHandler handles HTTP requests for the dashboard overview.
type DashboardHandler struct {
	stats DashboardStatsProvider
}

// NewDashboardHandler creates a new DashboardHandler.
func NewDashboardHandler(stats DashboardStatsProvider) *DashboardHandler {
	return &DashboardHandler{stats: stats}
}

// Stats handles GET /dashboard/stats.
func (h *DashboardHandler) Stats(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	stats, err := h.stats.GetDashboardStats(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to load dashboard stats")
		return
	}

	respond(w, http.StatusOK, stats)
}
