package handler

import (
	"net/http"

	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	"github.com/lifygo/lifygo/apps/api/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	if h.svc == nil {
		respondError(w, http.StatusNotFound, "local auth is not enabled")
		return
	}

	var input service.RegisterInput
	if !decodeJSON(w, r, &input) {
		return
	}

	resp, err := h.svc.Register(r.Context(), input)
	if err != nil {
		respondError(w, http.StatusConflict, err.Error())
		return
	}

	w.Header().Set("Set-Cookie", "lifygo_token="+resp.Token+"; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800")
	respond(w, http.StatusCreated, resp)
}

func (h *AuthHandler) SignIn(w http.ResponseWriter, r *http.Request) {
	if h.svc == nil {
		respondError(w, http.StatusNotFound, "local auth is not enabled")
		return
	}

	var input service.LoginInput
	if !decodeJSON(w, r, &input) {
		return
	}

	resp, err := h.svc.Login(r.Context(), input)
	if err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	w.Header().Set("Set-Cookie", "lifygo_token="+resp.Token+"; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800")
	respond(w, http.StatusOK, resp)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	if h.svc == nil {
		respondError(w, http.StatusNotFound, "local auth is not enabled")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	user, err := h.svc.GetUser(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid session")
		return
	}

	respond(w, http.StatusOK, user)
}

func (h *AuthHandler) SignOut(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Set-Cookie", "lifygo_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0")
	w.WriteHeader(http.StatusNoContent)
}
