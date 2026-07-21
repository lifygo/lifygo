package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string

	ClerkSecretKey     string
	ClerkWebhookSecret string

	AuthProvider string
	JWTSecret    string

	EncryptionKey string

	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	SQSQueueURL        string
	SchedulerRoleARN   string
	SQSQueueARN        string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		Environment:        getEnv("ENVIRONMENT", "development"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		RedisURL:           os.Getenv("REDIS_URL"),
		ClerkSecretKey:     os.Getenv("CLERK_SECRET_KEY"),
		ClerkWebhookSecret: os.Getenv("CLERK_WEBHOOK_SECRET"),
		AuthProvider:       getEnv("AUTH_PROVIDER", "clerk"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		EncryptionKey:      os.Getenv("ENCRYPTION_KEY"),
		AWSRegion:          getEnv("AWS_REGION", "ap-southeast-1"),
		AWSAccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		SQSQueueURL:        os.Getenv("SQS_QUEUE_URL"),
		SchedulerRoleARN:   os.Getenv("SCHEDULER_ROLE_ARN"),
		SQSQueueARN:        os.Getenv("SQS_QUEUE_ARN"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}
	if c.RedisURL == "" {
		return errors.New("REDIS_URL is required")
	}
	if c.EncryptionKey == "" {
		return errors.New("ENCRYPTION_KEY is required")
	}
	if c.AuthProvider == "clerk" {
		if c.ClerkSecretKey == "" {
			return errors.New("CLERK_SECRET_KEY is required when AUTH_PROVIDER=clerk")
		}
		if c.ClerkWebhookSecret == "" {
			return errors.New("CLERK_WEBHOOK_SECRET is required when AUTH_PROVIDER=clerk")
		}
	}
	if c.AuthProvider == "local" {
		if c.JWTSecret == "" {
			return errors.New("JWT_SECRET is required when AUTH_PROVIDER=local")
		}
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
