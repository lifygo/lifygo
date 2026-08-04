package config

import (
	"errors"
	"log"
	"os"
	"strconv"

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

	DefaultSMTPHost     string
	DefaultSMTPPort     int
	DefaultSMTPUsername string
	DefaultSMTPPassword string
	DefaultSMTPFrom     string

	MaxJobsPerUser    int
	MaxAPIKeysPerUser int
	RateLimitPerHour  int64
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

		DefaultSMTPHost:     getEnv("DEFAULT_SMTP_HOST", ""),
		DefaultSMTPPort:     getEnvInt("DEFAULT_SMTP_PORT", 587),
		DefaultSMTPUsername: getEnv("DEFAULT_SMTP_USERNAME", ""),
		DefaultSMTPPassword: os.Getenv("DEFAULT_SMTP_PASSWORD"),
		DefaultSMTPFrom:     getEnv("DEFAULT_SMTP_FROM", "noreply@lifygo.com"),

		MaxJobsPerUser:    getEnvInt("MAX_JOBS_PER_USER", 0),
		MaxAPIKeysPerUser: getEnvInt("MAX_API_KEYS_PER_USER", 0),
		RateLimitPerHour:  int64(getEnvInt("RATE_LIMIT_PER_HOUR", 10000)),
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

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		log.Printf("config: invalid integer for %s (%q), using default %d", key, value, fallback)
		return fallback
	}
	return parsed
}
