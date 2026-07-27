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

const keySize = 32
const apiKeyPrefix = "lfy_"
const otpCharset = "0123456789"

var (
	ErrInvalidKeySize    = fmt.Errorf("encryption key must be exactly %d bytes", keySize)
	ErrInvalidCiphertext = errors.New("invalid ciphertext")
	ErrEmptyPlaintext    = errors.New("plaintext must not be empty")
	ErrEmptyInput        = errors.New("input must not be empty")
)

type Crypto struct {
	key []byte
}

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

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return hex.EncodeToString(ciphertext), nil
}

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

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", ErrInvalidCiphertext
	}

	return string(plaintext), nil
}

func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return "", fmt.Errorf("failed to generate api key: %w", err)
	}
	return apiKeyPrefix + hex.EncodeToString(bytes), nil
}

func HashAPIKey(rawKey string) (string, error) {
	if rawKey == "" {
		return "", ErrEmptyInput
	}
	hash := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(hash[:]), nil
}

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
