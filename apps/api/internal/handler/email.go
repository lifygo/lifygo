package handler

import (
	"context"
	"net/http"
	"strconv"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// EmailServicer defines the operations the email handler needs.
type EmailServicer interface {
	Send(ctx context.Context, input model.SendEmailInput) (*model.SendEmailResponse, error)
	SendOTP(ctx context.Context, input model.SendOTPInput) (*model.SendOTPResponse, error)
	VerifyOTP(ctx context.Context, input model.VerifyOTPInput) (*model.VerifyOTPResponse, error)
	ListLogs(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, int, error)
}

// EmailHandler handles HTTP requests related to email sending and OTPs.
type EmailHandler struct {
	emails EmailServicer
}

// NewEmailHandler creates a new EmailHandler.
func NewEmailHandler(emails EmailServicer) *EmailHandler {
	return &EmailHandler{emails: emails}
}

// sendEmailRequest is the shape of the POST /send request body.
type sendEmailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
	IsHTML  bool   `json:"is_html"`
}

// sendOTPRequest is the shape of the POST /send/otp request body.
type sendOTPRequest struct {
	To string `json:"to"`
}

// verifyOTPRequest is the shape of the POST /verify/otp request body.
type verifyOTPRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// listLogsResponse wraps the logs list with pagination metadata.
type listLogsResponse struct {
	Logs   []model.EmailLog `json:"logs"`
	Total  int              `json:"total"`
	Limit  int              `json:"limit"`
	Offset int              `json:"offset"`
}

// Send handles POST /send.
// Sends a single transactional email using the user's SMTP config.
func (h *EmailHandler) Send(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req sendEmailRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.emails.Send(r.Context(), model.SendEmailInput{
		UserID:  userID,
		To:      req.To,
		Subject: req.Subject,
		Body:    req.Body,
		IsHTML:  req.IsHTML,
	})
	if err != nil {
		switch err {
		case model.ErrToRequired:
			respondError(w, http.StatusBadRequest, "to address is required")
		case model.ErrSubjectRequired:
			respondError(w, http.StatusBadRequest, "subject is required")
		case model.ErrBodyRequired:
			respondError(w, http.StatusBadRequest, "body is required")
		case model.ErrNotFound:
			respondError(w, http.StatusUnprocessableEntity, "smtp config not found — please add your smtp credentials first")
		default:
			respondError(w, http.StatusInternalServerError, "failed to send email")
		}
		return
	}

	respond(w, http.StatusOK, resp)
}

// SendOTP handles POST /send/otp.
// Generates a 6-digit OTP and sends it to the specified email address.
func (h *EmailHandler) SendOTP(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req sendOTPRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.emails.SendOTP(r.Context(), model.SendOTPInput{
		UserID: userID,
		To:     req.To,
	})
	if err != nil {
		switch err {
		case model.ErrToRequired:
			respondError(w, http.StatusBadRequest, "to address is required")
		case model.ErrNotFound:
			respondError(w, http.StatusUnprocessableEntity, "smtp config not found — please add your smtp credentials first")
		default:
			respondError(w, http.StatusInternalServerError, "failed to send otp")
		}
		return
	}

	respond(w, http.StatusOK, resp)
}

// VerifyOTP handles POST /verify/otp.
// Verifies a 6-digit OTP code for the given email address.
func (h *EmailHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req verifyOTPRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.emails.VerifyOTP(r.Context(), model.VerifyOTPInput{
		UserID: userID,
		Email:  req.Email,
		Code:   req.Code,
	})
	if err != nil {
		switch err {
		case model.ErrOTPNotFound:
			respondError(w, http.StatusUnprocessableEntity, "otp not found or has expired")
		case model.ErrOTPInvalid:
			respondError(w, http.StatusUnprocessableEntity, "invalid otp code")
		default:
			respondError(w, http.StatusInternalServerError, "failed to verify otp")
		}
		return
	}

	respond(w, http.StatusOK, resp)
}

// Logs handles GET /logs.
// Returns a paginated list of email send logs for the authenticated user.
// Query params: limit (default 50, max 100), offset (default 0), status (optional)
func (h *EmailHandler) Logs(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Parse pagination query parameters.
	limit := 50
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	// Parse optional status filter.
	var status *model.EmailStatus
	if s := r.URL.Query().Get("status"); s != "" {
		emailStatus := model.EmailStatus(s)
		status = &emailStatus
	}

	logs, total, err := h.emails.ListLogs(r.Context(), model.ListEmailLogsInput{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
		Status: status,
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list logs")
		return
	}

	respond(w, http.StatusOK, listLogsResponse{
		Logs:   logs,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	})
}
