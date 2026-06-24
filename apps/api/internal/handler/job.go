package handler

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// JobServicer defines the operations the job handler needs.
type JobServicer interface {
	Create(ctx context.Context, input model.CreateJobInput) (*model.Job, error)
	Get(ctx context.Context, id, userID string) (*model.Job, error)
	List(ctx context.Context, userID string) ([]model.Job, error)
	Delete(ctx context.Context, id, userID string) error
	ListExecutions(ctx context.Context, jobID, userID string, limit, offset int) ([]model.JobExecution, error)
}

// JobHandler handles HTTP requests related to scheduled jobs.
type JobHandler struct {
	jobs JobServicer
}

// NewJobHandler creates a new JobHandler.
func NewJobHandler(jobs JobServicer) *JobHandler {
	return &JobHandler{jobs: jobs}
}

// createJobRequest is the shape of the POST /jobs request body.
type createJobRequest struct {
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	ScheduleType   string  `json:"schedule_type"`
	CronExpression *string `json:"cron_expression"`
	RunAt          *string `json:"run_at"`
	WebhookURL     *string `json:"webhook_url"`
	WebhookPayload *string `json:"webhook_payload"`
	EmailTo        *string `json:"email_to"`
	EmailSubject   *string `json:"email_subject"`
	EmailBody      *string `json:"email_body"`
}

// Create handles POST /jobs.
func (h *JobHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createJobRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	// Parse run_at string to time.Time if provided.
	var runAt *time.Time
	if req.RunAt != nil {
		t, err := time.Parse(time.RFC3339, *req.RunAt)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid run_at format — use RFC3339 e.g. 2026-01-01T09:00:00Z")
			return
		}
		runAt = &t
	}

	job, err := h.jobs.Create(r.Context(), model.CreateJobInput{
		UserID:         userID,
		Name:           req.Name,
		Type:           model.JobType(req.Type),
		ScheduleType:   model.JobScheduleType(req.ScheduleType),
		CronExpression: req.CronExpression,
		RunAt:          runAt,
		WebhookURL:     req.WebhookURL,
		WebhookPayload: req.WebhookPayload,
		EmailTo:        req.EmailTo,
		EmailSubject:   req.EmailSubject,
		EmailBody:      req.EmailBody,
	})

	if err != nil {
		switch err {
		case model.ErrJobLimitReached:
			respondError(w, http.StatusUnprocessableEntity, err.Error())
		case model.ErrJobNameRequired,
			model.ErrJobTypeInvalid,
			model.ErrJobScheduleTypeInvalid,
			model.ErrJobCronExpressionRequired,
			model.ErrJobRunAtRequired,
			model.ErrJobWebhookURLRequired,
			model.ErrJobEmailToRequired,
			model.ErrJobEmailSubjectRequired,
			model.ErrJobEmailBodyRequired:
			respondError(w, http.StatusBadRequest, err.Error())
		default:
			respondError(w, http.StatusInternalServerError, "failed to create job")
		}
		return
	}

	respond(w, http.StatusCreated, job)
}

// List handles GET /jobs.
func (h *JobHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	jobs, err := h.jobs.List(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list jobs")
		return
	}

	respond(w, http.StatusOK, jobs)
}

// Get handles GET /jobs/{id}.
func (h *JobHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "job id is required")
		return
	}

	job, err := h.jobs.Get(r.Context(), id, userID)
	if err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "job not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get job")
		return
	}

	respond(w, http.StatusOK, job)
}

// Delete handles DELETE /jobs/{id}.
func (h *JobHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "job id is required")
		return
	}

	if err := h.jobs.Delete(r.Context(), id, userID); err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "job not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to delete job")
		return
	}

	respond(w, http.StatusOK, map[string]string{"message": "job deleted"})
}

// ListExecutions handles GET /jobs/{id}/executions.
func (h *JobHandler) ListExecutions(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "job id is required")
		return
	}

	limit := 20
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	execs, err := h.jobs.ListExecutions(r.Context(), id, userID, limit, offset)
	if err != nil {
		if err == model.ErrNotFound {
			respondError(w, http.StatusNotFound, "job not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list executions")
		return
	}

	respond(w, http.StatusOK, execs)
}
