package validator

import (
	"errors"
	"net/mail"
	"strings"
)

var (
	ErrInvalidEmail   = errors.New("invalid email address")
	ErrInvalidPort    = errors.New("invalid smtp port")
	ErrInvalidHost    = errors.New("invalid smtp host")
	ErrStringTooLong  = errors.New("value exceeds maximum length")
	ErrStringTooShort = errors.New("value is below minimum length")
	ErrInvalidURL     = errors.New("invalid url")
)

const (
	MaxEmailLength   = 254
	MaxSubjectLength = 998
	MaxBodyLength    = 10 * 1024 * 1024
	MaxNameLength    = 255
	MinPort          = 1
	MaxPort          = 65535
	MaxHostLength    = 255
)

func IsValidEmail(email string) bool {
	if email == "" {
		return false
	}
	if len(email) > MaxEmailLength {
		return false
	}
	if strings.TrimSpace(email) != email {
		return false
	}
	_, err := mail.ParseAddress(email)
	return err == nil
}

func ValidateEmail(email string) error {
	if !IsValidEmail(email) {
		return ErrInvalidEmail
	}
	return nil
}

func IsValidSMTPPort(port int) bool {
	return port >= MinPort && port <= MaxPort
}

func ValidateSMTPPort(port int) error {
	if !IsValidSMTPPort(port) {
		return ErrInvalidPort
	}
	return nil
}

func IsValidHost(host string) bool {
	if host == "" {
		return false
	}
	if len(host) > MaxHostLength {
		return false
	}
	if strings.ContainsAny(host, " \t\n\r") {
		return false
	}
	if strings.Contains(host, "://") {
		return false
	}
	return true
}

func ValidateHost(host string) error {
	if !IsValidHost(host) {
		return ErrInvalidHost
	}
	return nil
}

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

func IsValidURL(rawURL string) bool {
	if rawURL == "" {
		return false
	}
	return strings.HasPrefix(rawURL, "http://") || strings.HasPrefix(rawURL, "https://")
}

func ValidateURL(rawURL string) error {
	if !IsValidURL(rawURL) {
		return ErrInvalidURL
	}
	return nil
}
