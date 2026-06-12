package model

import "time"

// OTP represents a one-time password generated for email verification.
// OTPs are stored in Redis with a TTL — not in PostgreSQL.
// Redis handles expiry automatically, eliminating the need for
// a cleanup job or a used/expired flag in a database table.
type OTP struct {
	// Email is the recipient address the OTP was sent to.
	// Used as part of the Redis key to namespace OTPs per address.
	Email string `json:"email"`

	// Code is the 6-digit numeric code generated via crypto/rand.
	// Never stored in plain text in PostgreSQL.
	// Stored in Redis only for the duration of the TTL.
	Code string `json:"code"`

	// ExpiresAt is the time at which the OTP becomes invalid.
	// Derived from the Redis TTL at generation time.
	ExpiresAt time.Time `json:"expires_at"`
}

// OTPTTl is the duration an OTP remains valid after generation.
// After this duration Redis automatically deletes the key and
// the OTP cannot be verified regardless of the code.
const OTPTTl = 10 * time.Minute

// OTPLength is the number of digits in a generated OTP code.
// 6 digits provides 1,000,000 possible values which is sufficient
// for a 10-minute expiry window with rate limiting in place.
const OTPLength = 6

// SendOTPInput holds the data required to generate and send an OTP.
// Populated from the POST /send/otp request body.
type SendOTPInput struct {
	// UserID is set internally from the authenticated API key.
	// Never taken from the request body.
	UserID string

	// To is the recipient email address the OTP will be sent to.
	To string `json:"to"`
}

// Validate checks that all required fields are present and valid.
func (i *SendOTPInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.To == "" {
		return ErrToRequired
	}
	return nil
}

// SendOTPResponse is the shape returned to the client after
// a successful OTP generation and send.
// The code itself is never returned — the user receives it via email only.
type SendOTPResponse struct {
	// Email is the address the OTP was sent to.
	Email string `json:"email"`

	// ExpiresAt tells the client when the OTP will stop being valid.
	// Useful for displaying a countdown timer in the UI.
	ExpiresAt time.Time `json:"expires_at"`
}

// VerifyOTPInput holds the data required to verify an OTP code.
// Populated from the POST /verify/otp request body.
type VerifyOTPInput struct {
	// UserID is set internally from the authenticated API key.
	// Never taken from the request body.
	UserID string

	// Email is the address the OTP was originally sent to.
	// Used to look up the correct Redis key.
	Email string `json:"email"`

	// Code is the 6-digit code the end user submitted.
	Code string `json:"code"`
}

// Validate checks that all required fields are present and valid.
func (i *VerifyOTPInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Email == "" {
		return ErrEmailRequired
	}
	if i.Code == "" {
		return ErrOTPInvalid
	}
	if len(i.Code) != OTPLength {
		return ErrOTPInvalid
	}
	return nil
}

// VerifyOTPResponse is the shape returned to the client after
// a successful OTP verification.
type VerifyOTPResponse struct {
	// Email is the address the OTP was verified for.
	Email string `json:"email"`

	// Verified is always true when this response is returned.
	// A failed verification returns an error, not this struct.
	Verified bool `json:"verified"`

	// VerifiedAt is the timestamp of the successful verification.
	VerifiedAt time.Time `json:"verified_at"`
}

// OTPRedisKey returns the Redis key used to store an OTP for a given
// user and email combination. Namespacing by userID ensures that two
// different users sending an OTP to the same address do not collide.
func OTPRedisKey(userID, email string) string {
	return "otp:" + userID + ":" + email
}
