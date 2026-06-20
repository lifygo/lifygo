package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment variables required to run the API server.
// Every field is validated on startup. The application will not start
// if any required variable is missing or empty.
type Config struct {
	// Server
	Port        string
	Environment string

	// PostgreSQL
	DatabaseURL string

	// Redis
	RedisURL string

	// Clerk
	ClerkSecretKey     string
	ClerkWebhookSecret string

	// Encryption
	// AES-256 key used to encrypt SMTP passwords at rest.
	// Must be exactly 32 bytes when decoded.
	EncryptionKey string
}

// Load reads environment variables from the .env file if present,
// then validates that all required fields are set.
// In production the .env file will not exist and variables are
// expected to be injected directly into the environment.
func Load() (*Config, error) {
	// Ignore error — .env file is optional in production.
	_ = godotenv.Load()

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		Environment:        getEnv("ENVIRONMENT", "development"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		RedisURL:           os.Getenv("REDIS_URL"),
		ClerkSecretKey:     os.Getenv("CLERK_SECRET_KEY"),
		ClerkWebhookSecret: os.Getenv("CLERK_WEBHOOK_SECRET"),
		EncryptionKey:      os.Getenv("ENCRYPTION_KEY"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// validate checks that all required fields are present.
// Add new required fields here as the application grows.
func (c *Config) validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}
	if c.RedisURL == "" {
		return errors.New("REDIS_URL is required")
	}
	if c.ClerkSecretKey == "" {
		return errors.New("CLERK_SECRET_KEY is required")
	}
	if c.ClerkWebhookSecret == "" {
		return errors.New("CLERK_WEBHOOK_SECRET is required")
	}
	if c.EncryptionKey == "" {
		return errors.New("ENCRYPTION_KEY is required")
	}
	return nil
}

// getEnv returns the value of the environment variable named by key.
// If the variable is not set or empty, it returns the fallback value.
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
