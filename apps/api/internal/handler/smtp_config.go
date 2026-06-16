package handler

import (
	"context"
	"net/http"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// SMTPConfigServicer defines the operations the smtp config handler needs.
type SMTPConfigServicer interface {
	Upsert(ctx context.Context, input model.CreateSMTPConfigInput) (*model.SMTPConfigResponse, error)
	Get(ctx context.Context, userID string) (*model.SMTPConfigResponse, error)
	Delete(ctx context.Context, userID string) error
}

// SMTPConfigHandler handles HTTP requests related to SMTP configurations.
type SMTPConfigHandler struct {
	configs SMTPConfigServicer
}

// NewSMTPConfigHandler creates a new SMTPConfigHandler.
func NewSMTPConfigHandler(configs SMTPConfigServicer) *SMTPConfigHandler {
	return &SMTPConfigHandler{configs: configs}
}

// upsertSMTPConfigRequest is the shape of the POST /smtp-config request body.
type upsertSMTPConfigRequest struct {
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	FromAddress string `json:"from_address"`
}

// Upsert handles POST /smtp-config.
// Creates or replaces the SMTP config for the authenticated user.
// The password is encrypted before storage — never stored in plain text.
func (h *SMTPConfigHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req upsertSMTPConfigRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.configs.Upsert(r.Context(), model.CreateSMTPConfigInput{
		UserID:      userID,
		Host:        req.Host,
		Port:        req.Port,
		Username:    req.Username,
		Password:    req.Password,
		FromAddress: req.FromAddress,
	})
	if err != nil {
		switch err {
		case model.ErrSMTPHostRequired:
			respondError(w, http.StatusBadRequest, "smtp host is required")
		case model.ErrSMTPPortRequired:
			respondError(w, http.StatusBadRequest, "smtp port is required")
		case model.ErrSMTPUsernameRequired:
			respondError(w, http.StatusBadRequest, "smtp username is required")
		case model.ErrSMTPPasswordRequired:
			respondError(w, http.StatusBadRequest, "smtp password is required")
		case model.ErrSMTPFromRequired:
			respondError(w, http.StatusBadRequest, "smtp from address is required")
		default:
			respondError(w, http.StatusInternalServerError, "failed to save smtp config")
		}
		return
	}

	respond(w, http.StatusOK, resp)
}

// Get handles GET /smtp-config.
// Returns the SMTP config for the authenticated user.
// The encrypted password is never included in the response.
func (h *SMTPConfigHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	resp, err := h.configs.Get(r.Context(), userID)
	if err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "smtp config not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get smtp config")
		return
	}

	respond(w, http.StatusOK, resp)
}

// Delete handles DELETE /smtp-config.
// Removes the SMTP config for the authenticated user.
func (h *SMTPConfigHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if err := h.configs.Delete(r.Context(), userID); err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "smtp config not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to delete smtp config")
		return
	}

	respond(w, http.StatusOK, map[string]string{"message": "smtp config deleted"})
}
