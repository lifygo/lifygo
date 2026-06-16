package handler

import (
	"encoding/json"
	"net/http"
)

// respond writes a JSON response with the given status code and data.
// All handlers use this function to ensure consistent response formatting.
func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

// respondError writes a JSON error response with the given status code
// and message. All handlers use this for consistent error formatting.
func respondError(w http.ResponseWriter, status int, message string) {
	respond(w, status, map[string]string{"error": message})
}

// decodeJSON decodes the request body into the given target struct.
// Returns false and writes a 400 Bad Request if decoding fails.
func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return false
	}
	return true
}
