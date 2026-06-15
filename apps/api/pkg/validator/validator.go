package validator

import (
	"errors"
	"net/mail"
	"strings"
)

// Common validation errors returned by validator functions.
// Services and handlers check against these to return consistent
// error messages to API consumers.
var (
	ErrInvalidEmail   = errors.New("invalid email address")
	ErrInvalidPort    = errors.New("invalid smtp port")
	ErrInvalidHost    = errors.New("invalid smtp host")
	ErrStringTooLong  = errors.New("value exceeds maximum length")
	ErrStringTooShort = errors.New("value is below minimum length")
	ErrInvalidURL     = errors.New("invalid url")
)

// Length limits used across input validation.
// Centralized here so every model and handler enforces the same bounds.
const (
	// MaxEmailLength is the maximum allowed length for an email address.
	// RFC 5321 specifies 254 characters as the practical maximum.
	MaxEmailLength = 254

	// MaxSubjectLength is the maximum allowed length for an email subject.
	MaxSubjectLength = 998 // RFC 2822 line length limit minus "Subject: "

	// MaxBodyLength is the maximum allowed length for an email body.
	// 10 MB — generous for transactional emails, prevents abuse.
	MaxBodyLength = 10 * 1024 * 1024

	// MaxNameLength is the maximum allowed length for names
	// (user names, API key names, SMTP config labels).
	MaxNameLength = 255

	// MinPort is the minimum valid TCP port number.
	MinPort = 1

	// MaxPort is the maximum valid TCP port number.
	MaxPort = 65535

	// MaxHostLength is the maximum allowed length for an SMTP hostname.
	MaxHostLength = 255
)

// IsValidEmail checks whether the provided string is a syntactically
// valid email address. Uses net/mail for RFC 5322 compliant parsing.
// Does not verify that the address actually exists or can receive mail —
// only that the format is valid.
func IsValidEmail(email string) bool {
	if email == "" {
		return false
	}
	if len(email) > MaxEmailLength {
		return false
	}
	// Reject any leading or trailing whitespace. net/mail's ParseAddress
	// is lenient about surrounding whitespace per RFC 5322 folding rules,
	// but a leading or trailing space here is almost always a copy-paste
	// error and should be rejected rather than silently accepted.
	if strings.TrimSpace(email) != email {
		return false
	}
	_, err := mail.ParseAddress(email)
	return err == nil
}

// ValidateEmail returns an error if the provided string is not a
// valid email address. Returns nil if valid.
func ValidateEmail(email string) error {
	if !IsValidEmail(email) {
		return ErrInvalidEmail
	}
	return nil
}

// IsValidSMTPPort checks whether the provided port number is within
// the valid TCP port range.
// Does not restrict to specific SMTP ports (25, 465, 587) since some
// providers use non-standard ports.
func IsValidSMTPPort(port int) bool {
	return port >= MinPort && port <= MaxPort
}

// ValidateSMTPPort returns an error if the provided port number is
// not within the valid TCP port range. Returns nil if valid.
func ValidateSMTPPort(port int) error {
	if !IsValidSMTPPort(port) {
		return ErrInvalidPort
	}
	return nil
}

// IsValidHost checks whether the provided string is a non-empty
// hostname within the maximum allowed length.
// Does not perform DNS resolution — only format validation.
func IsValidHost(host string) bool {
	if host == "" {
		return false
	}
	if len(host) > MaxHostLength {
		return false
	}
	// Reject hosts containing any whitespace — this check must run
	// BEFORE any trimming, otherwise "smtp.gmail.com " would be
	// silently cleaned and incorrectly accepted.
	if strings.ContainsAny(host, " \t\n\r") {
		return false
	}
	// Reject hosts containing protocol prefixes.
	// SMTP host configs should be bare hostnames, e.g. "smtp.gmail.com",
	// not "https://smtp.gmail.com" or "smtp.gmail.com:587".
	if strings.Contains(host, "://") {
		return false
	}
	return true
}

// ValidateHost returns an error if the provided string is not a
// valid hostname. Returns nil if valid.
func ValidateHost(host string) error {
	if !IsValidHost(host) {
		return ErrInvalidHost
	}
	return nil
}

// ValidateLength returns an error if the provided string is shorter
// than min or longer than max. Pass min=0 to skip the minimum check.
// Length is measured in runes, not bytes, to correctly handle
// multi-byte UTF-8 characters.
func ValidateLength(value string, min, max int) error {
	length := len([]rune(value))
	if min > 0 && length < min {
		return ErrStringTooShort
	}
	if max > 0 && length > max {
		return ErrStringTooLong
	}
	return nil
}

// IsValidURL checks whether the provided string is a syntactically
// valid HTTP or HTTPS URL. Used for validating webhook URLs in
// Phase 2 (scheduled jobs).
func IsValidURL(rawURL string) bool {
	if rawURL == "" {
		return false
	}
	return strings.HasPrefix(rawURL, "http://") || strings.HasPrefix(rawURL, "https://")
}

// ValidateURL returns an error if the provided string is not a
// valid HTTP or HTTPS URL. Returns nil if valid.
func ValidateURL(rawURL string) error {
	if !IsValidURL(rawURL) {
		return ErrInvalidURL
	}
	return nil
}
