package service

import (
	"context"
	"fmt"
	"time"

	redisClient "github.com/lifygo/lifygo/apps/api/internal/redis"
)

const (
	FreeTierEmailLimit  = 1000
	FreeTierOTPLimit    = 50
	FreeTierJobLimit    = 3
)

type UsageService struct {
	redis *redisClient.Client
}

func NewUsageService(redis *redisClient.Client) *UsageService {
	return &UsageService{redis: redis}
}

func (s *UsageService) IncrementEmailCount(ctx context.Context, userID string) (int, error) {
	now := time.Now().UTC()
	key := fmt.Sprintf("usage:email:%s:%d-%02d", userID, now.Year(), now.Month())

	val, err := s.redis.Increment(ctx, key)
	if err != nil {
		return 0, fmt.Errorf("failed to increment email count: %w", err)
	}

	if err := s.redis.ExpireIfNotSet(ctx, key, 45*24*time.Hour); err != nil {
		return 0, fmt.Errorf("failed to set email count expiry: %w", err)
	}

	return int(val), nil
}

func (s *UsageService) IncrementOTPCount(ctx context.Context, userID string) (int, error) {
	now := time.Now().UTC()
	key := fmt.Sprintf("usage:otp:%s:%d-%02d-%02d", userID, now.Year(), now.Month(), now.Day())

	val, err := s.redis.Increment(ctx, key)
	if err != nil {
		return 0, fmt.Errorf("failed to increment otp count: %w", err)
	}

	if err := s.redis.ExpireIfNotSet(ctx, key, 48*time.Hour); err != nil {
		return 0, fmt.Errorf("failed to set otp count expiry: %w", err)
	}

	return int(val), nil
}
