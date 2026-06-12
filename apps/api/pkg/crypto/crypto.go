package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"math/big"
	"strings"
)

// keySize is the required AES-256 key size in bytes.
// The ENCRYPTION_KEY environment variable must decode to exactly this length.
const keySize = 32

// apiKeyPrefix is prepended to every generated API key.
// Makes LifyGo keys instantly recognizable in logs and dashboards.
const apiKeyPrefix = "lfy_"

// otpCharset is the set of digits used to generate OTP codes.
// Numeric only — avoids ambiguous characters like O/0 and I/1.
const otpCharset = "0123456789"

var (
	// ErrInvalidKeySize is returned when the encryption key is not 32 bytes.
	ErrInvalidKeySize = fmt.Errorf("encryption key must be exactly %d bytes", keySize)

	// ErrInvalidCiphertext is returned when decryption input is malformed.
	ErrInvalidCiphertext = errors.New("invalid ciphertext")

	// ErrEmptyPlaintext is returned when an empty string is passed to Encrypt.
	ErrEmptyPlaintext = errors.New("plaintext must not be empty")

	// ErrEmptyInput is returned when an empty string is passed to Hash.
	ErrEmptyInput = errors.New("input must not be empty")
)

// Crypto holds the parsed AES-256 encryption key.
// Instantiate once at startup and inject into services that need it.
type Crypto struct {
	key []byte
}

// New creates a new Crypto instance from a hex-encoded 32-byte key.
// The key must be a hex string representing exactly 32 bytes (64 hex characters).
// Generate a suitable key with: openssl rand -hex 32
func New(hexKey string) (*Crypto, error) {
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return nil, fmt.Errorf("failed to decode encryption key: %w", err)
	}
	if len(key) != keySize {
		return nil, ErrInvalidKeySize
	}
	return &Crypto{key: key}, nil
}

// Encrypt encrypts a plaintext string using AES-256-GCM.
// Returns a hex-encoded string of the format: nonce + ciphertext.
// GCM provides both confidentiality and integrity — tampering with
// the ciphertext will cause decryption to fail.
func (c *Crypto) Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", ErrEmptyPlaintext
	}

	block, err := aes.NewCipher(c.key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generate a random nonce. A new nonce must be used for every
	// encryption operation — reusing a nonce with the same key
	// completely breaks GCM security.
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Seal appends the encrypted ciphertext and GCM authentication tag
	// to the nonce. The result is: nonce || ciphertext || tag.
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return hex.EncodeToString(ciphertext), nil
}

// Decrypt decrypts a hex-encoded AES-256-GCM ciphertext produced by Encrypt.
// Returns the original plaintext string.
// Returns ErrInvalidCiphertext if the input is malformed or has been tampered with.
func (c *Crypto) Decrypt(hexCiphertext string) (string, error) {
	if hexCiphertext == "" {
		return "", ErrInvalidCiphertext
	}

	ciphertext, err := hex.DecodeString(hexCiphertext)
	if err != nil {
		return "", ErrInvalidCiphertext
	}

	block, err := aes.NewCipher(c.key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", ErrInvalidCiphertext
	}

	// Split the stored bytes back into nonce and ciphertext+tag.
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		// Do not expose the underlying error — it may leak information.
		return "", ErrInvalidCiphertext
	}

	return string(plaintext), nil
}

// GenerateAPIKey generates a cryptographically secure random API key.
// Format: lfy_<64 random hex characters>
// The raw key is returned once and must be shown to the user immediately.
// Only the SHA-256 hash is stored in the database.
func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return "", fmt.Errorf("failed to generate api key: %w", err)
	}
	return apiKeyPrefix + hex.EncodeToString(bytes), nil
}

// HashAPIKey returns the SHA-256 hash of a raw API key as a hex string.
// This is the value stored in the database and used for lookups.
// SHA-256 is appropriate here because API keys are long random strings
// with sufficient entropy — bcrypt's cost is unnecessary.
func HashAPIKey(rawKey string) (string, error) {
	if rawKey == "" {
		return "", ErrEmptyInput
	}
	hash := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(hash[:]), nil
}

// GenerateOTP generates a cryptographically secure numeric OTP code
// of the specified length using crypto/rand.
// Never use math/rand for OTP generation — it is not cryptographically secure.
func GenerateOTP(length int) (string, error) {
	if length <= 0 {
		return "", errors.New("otp length must be greater than zero")
	}

	var sb strings.Builder
	sb.Grow(length)

	charsetLen := big.NewInt(int64(len(otpCharset)))

	for i := 0; i < length; i++ {
		index, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", fmt.Errorf("failed to generate otp digit: %w", err)
		}
		sb.WriteByte(otpCharset[index.Int64()])
	}

	return sb.String(), nil
}
