package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Client wraps redis.Client to provide a single managed connection
// to Redis. All rate limiting and OTP operations use this client.
type Client struct {
	*redis.Client
}

// Config holds the connection parameters for Redis.
type Config struct {
	// RedisURL is the full Redis connection string.
	// Format: redis://:password@host:port/db
	RedisURL string

	// DialTimeout is the timeout for establishing a new connection.
	// Default: 5 seconds
	DialTimeout time.Duration

	// ReadTimeout is the timeout for socket reads.
	// Default: 3 seconds
	ReadTimeout time.Duration

	// WriteTimeout is the timeout for socket writes.
	// Default: 3 seconds
	WriteTimeout time.Duration

	// PoolSize is the maximum number of socket connections.
	// Default: 10
	PoolSize int

	// MinIdleConns is the minimum number of idle connections
	// the pool will maintain. Default: 2
	MinIdleConns int
}

// DefaultConfig returns a Config with safe defaults for production.
func DefaultConfig(redisURL string) Config {
	return Config{
		RedisURL:     redisURL,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
		MinIdleConns: 2,
	}
}

// Connect establishes a connection to Redis using the provided
// configuration. It verifies the connection with a ping before returning.
// The caller is responsible for calling Client.Close() when done.
func Connect(ctx context.Context, cfg Config) (*Client, error) {
	opts, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	opts.DialTimeout = cfg.DialTimeout
	opts.ReadTimeout = cfg.ReadTimeout
	opts.WriteTimeout = cfg.WriteTimeout
	opts.PoolSize = cfg.PoolSize
	opts.MinIdleConns = cfg.MinIdleConns

	client := redis.NewClient(opts)

	// Verify the connection is alive before returning.
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("failed to ping redis: %w", err)
	}

	return &Client{client}, nil
}

// Health checks whether the Redis connection is alive.
// Used by the health check endpoint to report Redis status.
func (c *Client) Health(ctx context.Context) error {
	if err := c.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis ping failed: %w", err)
	}
	return nil
}

// SetWithTTL stores a key-value pair with an expiration duration.
// Used for OTP storage where keys must expire automatically.
func (c *Client) SetWithTTL(ctx context.Context, key, value string, ttl time.Duration) error {
	if err := c.Set(ctx, key, value, ttl).Err(); err != nil {
		return fmt.Errorf("failed to set key %s: %w", key, err)
	}
	return nil
}

// GetAndDelete atomically retrieves and deletes a key.
// Used for OTP verification to ensure a code can only be used once.
func (c *Client) GetAndDelete(ctx context.Context, key string) (string, error) {
	pipe := c.Pipeline()

	get := pipe.Get(ctx, key)
	pipe.Del(ctx, key)

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return "", fmt.Errorf("failed to get and delete key %s: %w", key, err)
	}

	value, err := get.Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get key %s: %w", key, err)
	}

	return value, nil
}

// Increment increments the integer value of a key by one.
// If the key does not exist it is set to 1.
// Returns the new value after incrementing.
// Used for rate limiting counters.
func (c *Client) Increment(ctx context.Context, key string) (int64, error) {
	val, err := c.Incr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to increment key %s: %w", key, err)
	}
	return val, nil
}

// ExpireIfNotSet sets a TTL on a key only if it does not already have one.
// Used to set the rate limit window on first request without resetting
// the window on subsequent requests within the same period.
func (c *Client) ExpireIfNotSet(ctx context.Context, key string, ttl time.Duration) error {
	// TTL returns -1 if the key exists but has no expiry.
	// TTL returns -2 if the key does not exist.
	result, err := c.TTL(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("failed to get TTL for key %s: %w", key, err)
	}

	if result == -1 {
		if err := c.Expire(ctx, key, ttl).Err(); err != nil {
			return fmt.Errorf("failed to set expiry for key %s: %w", key, err)
		}
	}

	return nil
}
