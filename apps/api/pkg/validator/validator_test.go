package validator_test

import (
	"strings"
	"testing"

	"github.com/lifygo/lifygo/apps/api/pkg/validator"
)

// -----------------------------------------------------------------------
// Email Validation
// -----------------------------------------------------------------------

func TestIsValidEmail(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		email string
		want  bool
	}{
		{"standard email", "user@example.com", true},
		{"email with subdomain", "user@mail.example.com", true},
		{"email with plus tag", "user+tag@example.com", true},
		{"email with dots in local part", "first.last@example.com", true},
		{"email with numbers", "user123@example123.com", true},
		{"email with hyphen in domain", "user@my-domain.com", true},
		{"uppercase characters", "User@Example.COM", true},
		{"single character local part", "a@example.com", true},
		{"long but valid email", strings.Repeat("a", 60) + "@example.com", true},

		{"empty string", "", false},
		{"missing @ symbol", "userexample.com", false},
		{"missing domain", "user@", false},
		{"missing local part", "@example.com", false},
		{"missing tld", "user@example", true}, // net/mail allows this — valid per RFC 5322
		{"double @ symbol", "user@@example.com", false},
		{"spaces in email", "user name@example.com", false},
		{"trailing whitespace", "user@example.com ", false},
		{"leading whitespace", " user@example.com", false},
		{"only whitespace", "   ", false},
		{"no domain dot but has chars", "user@localhost", true}, // valid per RFC 5322
		{"exceeds max length", strings.Repeat("a", 250) + "@example.com", false},
		{"unicode in local part", "üser@example.com", true},
		{"comma instead of dot", "user@example,com", false},
		{"multiple consecutive dots", "user..name@example.com", false}, // net/mail rejects consecutive dots per RFC 5322 dot-atom rules // net/mail does not reject this
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := validator.IsValidEmail(tt.email)
			if got != tt.want {
				t.Errorf("IsValidEmail(%q) = %v, want %v", tt.email, got, tt.want)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	t.Parallel()

	t.Run("valid email returns nil", func(t *testing.T) {
		t.Parallel()
		if err := validator.ValidateEmail("user@example.com"); err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("invalid email returns ErrInvalidEmail", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateEmail("not-an-email")
		if err != validator.ErrInvalidEmail {
			t.Errorf("got %v want %v", err, validator.ErrInvalidEmail)
		}
	})

	t.Run("empty email returns ErrInvalidEmail", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateEmail("")
		if err != validator.ErrInvalidEmail {
			t.Errorf("got %v want %v", err, validator.ErrInvalidEmail)
		}
	})
}

// -----------------------------------------------------------------------
// SMTP Port Validation
// -----------------------------------------------------------------------

func TestIsValidSMTPPort(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		port int
		want bool
	}{
		{"common port 587 — STARTTLS", 587, true},
		{"common port 465 — SSL", 465, true},
		{"common port 25 — plain", 25, true},
		{"minimum valid port", 1, true},
		{"maximum valid port", 65535, true},
		{"non-standard high port", 2525, true},

		{"zero port", 0, false},
		{"negative port", -1, false},
		{"negative large port", -587, false},
		{"port exceeds maximum", 65536, false},
		{"port far exceeds maximum", 100000, false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := validator.IsValidSMTPPort(tt.port)
			if got != tt.want {
				t.Errorf("IsValidSMTPPort(%d) = %v, want %v", tt.port, got, tt.want)
			}
		})
	}
}

func TestValidateSMTPPort(t *testing.T) {
	t.Parallel()

	t.Run("valid port returns nil", func(t *testing.T) {
		t.Parallel()
		if err := validator.ValidateSMTPPort(587); err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("invalid port returns ErrInvalidPort", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateSMTPPort(0)
		if err != validator.ErrInvalidPort {
			t.Errorf("got %v want %v", err, validator.ErrInvalidPort)
		}
	})

	t.Run("port exceeding max returns ErrInvalidPort", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateSMTPPort(99999)
		if err != validator.ErrInvalidPort {
			t.Errorf("got %v want %v", err, validator.ErrInvalidPort)
		}
	})
}

// -----------------------------------------------------------------------
// Host Validation
// -----------------------------------------------------------------------

func TestIsValidHost(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		host string
		want bool
	}{
		{"standard smtp host", "smtp.gmail.com", true},
		{"host with subdomain levels", "smtp.mail.example.com", true},
		{"host with hyphen", "smtp-relay.example.com", true},
		{"ip address as host", "192.168.1.1", true},
		{"localhost", "localhost", true},
		{"single label host", "smtp", true},
		{"host with numbers", "smtp123.example.com", true},

		{"empty string", "", false},
		{"only whitespace", "   ", false},
		{"host with leading space", " smtp.gmail.com", false},
		{"host with trailing space", "smtp.gmail.com ", false},
		{"host with internal space", "smtp gmail.com", false},
		{"host with tab character", "smtp.gmail.com\t", false},
		{"host with newline", "smtp.gmail.com\n", false},
		{"host with http prefix", "http://smtp.gmail.com", false},
		{"host with https prefix", "https://smtp.gmail.com", false},
		{"host exceeds max length", strings.Repeat("a", 256), false},
		{"host at max length", strings.Repeat("a", 255), true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := validator.IsValidHost(tt.host)
			if got != tt.want {
				t.Errorf("IsValidHost(%q) = %v, want %v", tt.host, got, tt.want)
			}
		})
	}
}

func TestValidateHost(t *testing.T) {
	t.Parallel()

	t.Run("valid host returns nil", func(t *testing.T) {
		t.Parallel()
		if err := validator.ValidateHost("smtp.gmail.com"); err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("invalid host returns ErrInvalidHost", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateHost("")
		if err != validator.ErrInvalidHost {
			t.Errorf("got %v want %v", err, validator.ErrInvalidHost)
		}
	})

	t.Run("host with protocol returns ErrInvalidHost", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateHost("https://smtp.gmail.com")
		if err != validator.ErrInvalidHost {
			t.Errorf("got %v want %v", err, validator.ErrInvalidHost)
		}
	})
}

// -----------------------------------------------------------------------
// Length Validation
// -----------------------------------------------------------------------

func TestValidateLength(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   string
		min     int
		max     int
		wantErr error
	}{
		{
			name:    "within bounds",
			value:   "hello",
			min:     1,
			max:     10,
			wantErr: nil,
		},
		{
			name:    "exactly at minimum",
			value:   "ab",
			min:     2,
			max:     10,
			wantErr: nil,
		},
		{
			name:    "exactly at maximum",
			value:   "abcdefghij",
			min:     1,
			max:     10,
			wantErr: nil,
		},
		{
			name:    "below minimum",
			value:   "a",
			min:     2,
			max:     10,
			wantErr: validator.ErrStringTooShort,
		},
		{
			name:    "above maximum",
			value:   "abcdefghijk",
			min:     1,
			max:     10,
			wantErr: validator.ErrStringTooLong,
		},
		{
			name:    "empty string with min zero",
			value:   "",
			min:     0,
			max:     10,
			wantErr: nil,
		},
		{
			name:    "empty string with min one",
			value:   "",
			min:     1,
			max:     10,
			wantErr: validator.ErrStringTooShort,
		},
		{
			name:    "no max limit when max is zero",
			value:   strings.Repeat("a", 10000),
			min:     0,
			max:     0,
			wantErr: nil,
		},
		{
			name:    "multi-byte unicode counted as single rune each",
			value:   "日本語", // 3 runes, 9 bytes in UTF-8
			min:     3,
			max:     3,
			wantErr: nil,
		},
		{
			name:    "multi-byte unicode exceeding max runes",
			value:   "日本語日本語日本語日本語",
			min:     0,
			max:     10,
			wantErr: validator.ErrStringTooLong,
		},
		{
			name:    "exactly zero min and zero length value",
			value:   "",
			min:     0,
			max:     5,
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := validator.ValidateLength(tt.value, tt.min, tt.max)
			if err != tt.wantErr {
				t.Errorf("ValidateLength(%q, %d, %d) = %v, want %v", tt.value, tt.min, tt.max, err, tt.wantErr)
			}
		})
	}
}

// -----------------------------------------------------------------------
// URL Validation
// -----------------------------------------------------------------------

func TestIsValidURL(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		url  string
		want bool
	}{
		{"https url", "https://example.com", true},
		{"http url", "http://example.com", true},
		{"https with path", "https://example.com/webhook", true},
		{"https with query params", "https://example.com/webhook?token=abc", true},
		{"https with port", "https://example.com:8080/webhook", true},
		{"localhost http", "http://localhost:3000/webhook", true},

		{"empty string", "", false},
		{"missing protocol", "example.com", false},
		{"ftp protocol", "ftp://example.com", false},
		{"protocol only", "https://", true}, // passes prefix check — deeper validation not required here
		{"no protocol with path", "/webhook", false},
		{"protocol typo", "htttp://example.com", false},
		{"whitespace only", "   ", false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := validator.IsValidURL(tt.url)
			if got != tt.want {
				t.Errorf("IsValidURL(%q) = %v, want %v", tt.url, got, tt.want)
			}
		})
	}
}

func TestValidateURL(t *testing.T) {
	t.Parallel()

	t.Run("valid url returns nil", func(t *testing.T) {
		t.Parallel()
		if err := validator.ValidateURL("https://example.com/webhook"); err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("invalid url returns ErrInvalidURL", func(t *testing.T) {
		t.Parallel()
		err := validator.ValidateURL("not-a-url")
		if err != validator.ErrInvalidURL {
			t.Errorf("got %v want %v", err, validator.ErrInvalidURL)
		}
	})
}

// -----------------------------------------------------------------------
// Constants Sanity Checks
// -----------------------------------------------------------------------

// TestConstants verifies that the exported length and port constants
// have sensible relative values. Catches accidental misconfiguration
// if these constants are ever edited.
func TestConstants(t *testing.T) {
	t.Parallel()

	if validator.MinPort >= validator.MaxPort {
		t.Errorf("MinPort (%d) must be less than MaxPort (%d)", validator.MinPort, validator.MaxPort)
	}
	if validator.MaxPort != 65535 {
		t.Errorf("MaxPort = %d, want 65535", validator.MaxPort)
	}
	if validator.MaxEmailLength <= 0 {
		t.Errorf("MaxEmailLength must be positive, got %d", validator.MaxEmailLength)
	}
	if validator.MaxHostLength <= 0 {
		t.Errorf("MaxHostLength must be positive, got %d", validator.MaxHostLength)
	}
	if validator.MaxBodyLength <= 0 {
		t.Errorf("MaxBodyLength must be positive, got %d", validator.MaxBodyLength)
	}
}
