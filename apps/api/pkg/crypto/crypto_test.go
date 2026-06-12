package crypto_test

import (
	"strings"
	"testing"

	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
)

// validHexKey is a 32-byte key encoded as 64 hex characters.
// Used as the base valid key across all encryption tests.
const validHexKey = "6368616e676520746869732070617373776f726420746f206120736563726574"

// -----------------------------------------------------------------------
// New
// -----------------------------------------------------------------------

func TestNew(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		hexKey  string
		wantErr bool
	}{
		{
			name:    "valid 32 byte key",
			hexKey:  validHexKey,
			wantErr: false,
		},
		{
			name:    "empty key",
			hexKey:  "",
			wantErr: true,
		},
		{
			name:    "key too short — 16 bytes",
			hexKey:  "6368616e676520746869732070617373",
			wantErr: true,
		},
		{
			name:    "key too long — 64 bytes",
			hexKey:  validHexKey + validHexKey,
			wantErr: true,
		},
		{
			name:    "invalid hex characters",
			hexKey:  "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
			wantErr: true,
		},
		{
			name:    "odd length hex string",
			hexKey:  "6368616e676520746869732070617373776f726420746869732070617373776",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c, err := crypto.New(tt.hexKey)
			if tt.wantErr {
				if err == nil {
					t.Errorf("expected error but got nil")
				}
				if c != nil {
					t.Errorf("expected nil Crypto but got non-nil")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if c == nil {
				t.Errorf("expected non-nil Crypto but got nil")
			}
		})
	}
}

// -----------------------------------------------------------------------
// Encrypt
// -----------------------------------------------------------------------

func TestEncrypt(t *testing.T) {
	t.Parallel()

	c, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto: %v", err)
	}

	tests := []struct {
		name      string
		plaintext string
		wantErr   bool
	}{
		{
			name:      "standard smtp password",
			plaintext: "supersecretpassword123",
			wantErr:   false,
		},
		{
			name:      "single character",
			plaintext: "a",
			wantErr:   false,
		},
		{
			name:      "unicode characters",
			plaintext: "pässwörd-日本語",
			wantErr:   false,
		},
		{
			name:      "very long string — 10000 characters",
			plaintext: strings.Repeat("a", 10000),
			wantErr:   false,
		},
		{
			name:      "string with special characters",
			plaintext: `p@$$w0rd!#%^&*()_+-=[]{}|;':",.<>?/~` + "`",
			wantErr:   false,
		},
		{
			name:      "string with newlines and tabs",
			plaintext: "line1\nline2\ttabbed",
			wantErr:   false,
		},
		{
			name:      "empty string",
			plaintext: "",
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ciphertext, err := c.Encrypt(tt.plaintext)
			if tt.wantErr {
				if err == nil {
					t.Errorf("expected error but got nil")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if ciphertext == "" {
				t.Errorf("expected non-empty ciphertext")
			}
			if ciphertext == tt.plaintext {
				t.Errorf("ciphertext must not equal plaintext")
			}
		})
	}
}

// TestEncryptProducesUniqueOutputs verifies that encrypting the same
// plaintext twice produces different ciphertexts due to random nonce generation.
// If two encryptions of the same value produce the same output, the nonce
// is not being randomized correctly — a critical security failure.
func TestEncryptProducesUniqueOutputs(t *testing.T) {
	t.Parallel()

	c, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto: %v", err)
	}

	plaintext := "same-password-every-time"

	first, err := c.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("first encryption failed: %v", err)
	}

	second, err := c.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("second encryption failed: %v", err)
	}

	if first == second {
		t.Errorf("two encryptions of the same plaintext must produce different ciphertexts — nonce reuse detected")
	}
}

// -----------------------------------------------------------------------
// Decrypt
// -----------------------------------------------------------------------

func TestDecrypt(t *testing.T) {
	t.Parallel()

	c, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto: %v", err)
	}

	tests := []struct {
		name      string
		plaintext string
		wantErr   bool
	}{
		{
			name:      "standard smtp password",
			plaintext: "supersecretpassword123",
		},
		{
			name:      "single character",
			plaintext: "a",
		},
		{
			name:      "unicode characters",
			plaintext: "pässwörd-日本語",
		},
		{
			name:      "very long string",
			plaintext: strings.Repeat("z", 10000),
		},
		{
			name:      "special characters",
			plaintext: `p@$$w0rd!#%^&*()_+-=[]{}|;':",.<>?/~` + "`",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ciphertext, err := c.Encrypt(tt.plaintext)
			if err != nil {
				t.Fatalf("encryption failed: %v", err)
			}

			decrypted, err := c.Decrypt(ciphertext)
			if err != nil {
				t.Errorf("unexpected decryption error: %v", err)
			}
			if decrypted != tt.plaintext {
				t.Errorf("decrypted value does not match original: got %q want %q", decrypted, tt.plaintext)
			}
		})
	}
}

func TestDecryptInvalidInputs(t *testing.T) {
	t.Parallel()

	c, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto: %v", err)
	}

	tests := []struct {
		name       string
		ciphertext string
	}{
		{
			name:       "empty string",
			ciphertext: "",
		},
		{
			name:       "plain text — not encrypted",
			ciphertext: "notencryptedatall",
		},
		{
			name:       "invalid hex",
			ciphertext: "zzzzzzzzzzzzzzzz",
		},
		{
			name:       "truncated ciphertext",
			ciphertext: "6368616e",
		},
		{
			name:       "tampered ciphertext — single bit flip",
			ciphertext: "0000000000000000000000000000000000000000000000000000000000000000",
		},
		{
			name:       "random garbage hex",
			ciphertext: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result, err := c.Decrypt(tt.ciphertext)
			if err == nil {
				t.Errorf("expected error but got nil with result: %q", result)
			}
		})
	}
}

// TestDecryptWithWrongKey verifies that ciphertext encrypted with one key
// cannot be decrypted with a different key.
func TestDecryptWithWrongKey(t *testing.T) {
	t.Parallel()

	keyA, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto A: %v", err)
	}

	// A different but valid 32-byte key.
	keyB, err := crypto.New("0000000000000000000000000000000000000000000000000000000000000000")
	if err != nil {
		t.Fatalf("failed to create crypto B: %v", err)
	}

	ciphertext, err := keyA.Encrypt("secret-smtp-password")
	if err != nil {
		t.Fatalf("encryption failed: %v", err)
	}

	_, err = keyB.Decrypt(ciphertext)
	if err == nil {
		t.Errorf("expected error when decrypting with wrong key but got nil")
	}
}

// -----------------------------------------------------------------------
// GenerateAPIKey
// -----------------------------------------------------------------------

func TestGenerateAPIKey(t *testing.T) {
	t.Parallel()

	t.Run("has correct prefix", func(t *testing.T) {
		t.Parallel()
		key, err := crypto.GenerateAPIKey()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !strings.HasPrefix(key, "lfy_") {
			t.Errorf("api key must start with lfy_ but got: %s", key)
		}
	})

	t.Run("has correct length", func(t *testing.T) {
		t.Parallel()
		key, err := crypto.GenerateAPIKey()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		// lfy_ (4) + 64 hex chars (32 bytes) = 68
		expected := 68
		if len(key) != expected {
			t.Errorf("api key length: got %d want %d", len(key), expected)
		}
	})

	t.Run("generates unique keys", func(t *testing.T) {
		t.Parallel()
		seen := make(map[string]struct{})
		for i := 0; i < 1000; i++ {
			key, err := crypto.GenerateAPIKey()
			if err != nil {
				t.Fatalf("unexpected error on iteration %d: %v", i, err)
			}
			if _, exists := seen[key]; exists {
				t.Errorf("duplicate api key generated on iteration %d: %s", i, key)
			}
			seen[key] = struct{}{}
		}
	})

	t.Run("key contains only valid characters after prefix", func(t *testing.T) {
		t.Parallel()
		key, err := crypto.GenerateAPIKey()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		suffix := strings.TrimPrefix(key, "lfy_")
		for i, ch := range suffix {
			if !isHexChar(ch) {
				t.Errorf("non-hex character %q at position %d in api key", ch, i)
			}
		}
	})
}

// -----------------------------------------------------------------------
// HashAPIKey
// -----------------------------------------------------------------------

func TestHashAPIKey(t *testing.T) {
	t.Parallel()

	t.Run("same input produces same hash", func(t *testing.T) {
		t.Parallel()
		key := "lfy_abc123"
		hashA, err := crypto.HashAPIKey(key)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		hashB, err := crypto.HashAPIKey(key)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if hashA != hashB {
			t.Errorf("same input must produce same hash: got %s and %s", hashA, hashB)
		}
	})

	t.Run("different inputs produce different hashes", func(t *testing.T) {
		t.Parallel()
		hashA, err := crypto.HashAPIKey("lfy_key_one")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		hashB, err := crypto.HashAPIKey("lfy_key_two")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if hashA == hashB {
			t.Errorf("different inputs must not produce the same hash")
		}
	})

	t.Run("hash is 64 hex characters — sha256", func(t *testing.T) {
		t.Parallel()
		hash, err := crypto.HashAPIKey("lfy_somekey")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(hash) != 64 {
			t.Errorf("sha256 hex hash length: got %d want 64", len(hash))
		}
	})

	t.Run("empty input returns error", func(t *testing.T) {
		t.Parallel()
		_, err := crypto.HashAPIKey("")
		if err == nil {
			t.Errorf("expected error for empty input but got nil")
		}
	})

	t.Run("hash does not contain raw key", func(t *testing.T) {
		t.Parallel()
		rawKey := "lfy_verysecretkey"
		hash, err := crypto.HashAPIKey(rawKey)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if strings.Contains(hash, rawKey) {
			t.Errorf("hash must not contain the raw key")
		}
	})
}

// -----------------------------------------------------------------------
// GenerateOTP
// -----------------------------------------------------------------------

func TestGenerateOTP(t *testing.T) {
	t.Parallel()

	t.Run("generates correct length — 6 digits", func(t *testing.T) {
		t.Parallel()
		otp, err := crypto.GenerateOTP(6)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(otp) != 6 {
			t.Errorf("otp length: got %d want 6", len(otp))
		}
	})

	t.Run("generates correct length — 8 digits", func(t *testing.T) {
		t.Parallel()
		otp, err := crypto.GenerateOTP(8)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(otp) != 8 {
			t.Errorf("otp length: got %d want 8", len(otp))
		}
	})

	t.Run("contains only numeric digits", func(t *testing.T) {
		t.Parallel()
		for i := 0; i < 1000; i++ {
			otp, err := crypto.GenerateOTP(6)
			if err != nil {
				t.Fatalf("unexpected error on iteration %d: %v", i, err)
			}
			for j, ch := range otp {
				if ch < '0' || ch > '9' {
					t.Errorf("non-numeric character %q at position %d in otp %s", ch, j, otp)
				}
			}
		}
	})

	t.Run("generates unique codes", func(t *testing.T) {
		t.Parallel()
		// With 1,000,000 possible 6-digit codes, generating 1000 should
		// produce no collisions under normal circumstances.
		seen := make(map[string]int)
		for i := 0; i < 1000; i++ {
			otp, err := crypto.GenerateOTP(6)
			if err != nil {
				t.Fatalf("unexpected error on iteration %d: %v", i, err)
			}
			seen[otp]++
		}
		// Allow for extremely rare collisions but flag systematic ones.
		for code, count := range seen {
			if count > 3 {
				t.Errorf("otp %s appeared %d times — possible rand bias", code, count)
			}
		}
	})

	t.Run("zero length returns error", func(t *testing.T) {
		t.Parallel()
		_, err := crypto.GenerateOTP(0)
		if err == nil {
			t.Errorf("expected error for zero length but got nil")
		}
	})

	t.Run("negative length returns error", func(t *testing.T) {
		t.Parallel()
		_, err := crypto.GenerateOTP(-1)
		if err == nil {
			t.Errorf("expected error for negative length but got nil")
		}
	})
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

// isHexChar returns true if the rune is a valid lowercase hex character.
func isHexChar(r rune) bool {
	return (r >= '0' && r <= '9') || (r >= 'a' && r <= 'f')
}
