package model

import "errors"

// Domain errors used across all models.
// These are the canonical error values that services and handlers
// check against. Never return raw database errors to callers —
// always map them to one of these.
var (
	// General
	ErrNotFound      = errors.New("record not found")
	ErrAlreadyExists = errors.New("record already exists")
	ErrUnauthorized  = errors.New("unauthorized")
	ErrForbidden     = errors.New("forbidden")

	// User
	ErrClerkUserIDRequired = errors.New("clerk user id is required")
	ErrNameRequired        = errors.New("name is required")
	ErrEmailRequired       = errors.New("email is required")

	// API Key
	ErrAPIKeyRequired     = errors.New("api key is required")
	ErrAPIKeyNameRequired = errors.New("api key name is required")
	ErrAPIKeyExpired      = errors.New("api key has expired")
	ErrAPIKeyLimitReached = errors.New("api key limit reached")

	// SMTP
	ErrSMTPHostRequired     = errors.New("smtp host is required")
	ErrSMTPPortRequired     = errors.New("smtp port is required")
	ErrSMTPUsernameRequired = errors.New("smtp username is required")
	ErrSMTPPasswordRequired = errors.New("smtp password is required")
	ErrSMTPFromRequired     = errors.New("smtp from address is required")

	// Email
	ErrToRequired      = errors.New("to address is required")
	ErrSubjectRequired = errors.New("subject is required")
	ErrBodyRequired    = errors.New("body is required")

	// OTP
	ErrOTPNotFound = errors.New("otp not found or already used")
	ErrOTPExpired  = errors.New("otp has expired")
	ErrOTPInvalid  = errors.New("otp code is invalid")

	// Rate Limit
	ErrRateLimitExceeded = errors.New("rate limit exceeded")
)
