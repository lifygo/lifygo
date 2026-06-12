package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool wraps pgxpool.Pool to provide a single managed connection pool
// to PostgreSQL. All repositories receive this pool and never open
// their own connections.
type Pool struct {
	*pgxpool.Pool
}

// Config holds the tuning parameters for the connection pool.
// These values are deliberately conservative for a single VM deployment
// and should be reviewed before scaling horizontally.
type Config struct {
	// DatabaseURL is the full PostgreSQL connection string.
	// Format: postgres://user:password@host:port/dbname?sslmode=disable
	DatabaseURL string

	// MaxConns is the maximum number of connections in the pool.
	// Default: 25
	MaxConns int32

	// MinConns is the minimum number of idle connections the pool
	// will maintain. Default: 5
	MinConns int32

	// MaxConnLifetime is the maximum amount of time a connection
	// may be reused. Default: 1 hour
	MaxConnLifetime time.Duration

	// MaxConnIdleTime is the maximum amount of time a connection
	// may be idle before it is closed. Default: 30 minutes
	MaxConnIdleTime time.Duration

	// HealthCheckPeriod is how often the pool checks that connections
	// are still alive. Default: 1 minute
	HealthCheckPeriod time.Duration
}

// DefaultConfig returns a Config with safe defaults for production.
func DefaultConfig(databaseURL string) Config {
	return Config{
		DatabaseURL:       databaseURL,
		MaxConns:          25,
		MinConns:          5,
		MaxConnLifetime:   1 * time.Hour,
		MaxConnIdleTime:   30 * time.Minute,
		HealthCheckPeriod: 1 * time.Minute,
	}
}

// Connect establishes a connection pool to PostgreSQL using the provided
// configuration. It verifies the connection with a ping before returning.
// The caller is responsible for calling Pool.Close() when done.
func Connect(ctx context.Context, cfg Config) (*Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	poolConfig.MaxConns = cfg.MaxConns
	poolConfig.MinConns = cfg.MinConns
	poolConfig.MaxConnLifetime = cfg.MaxConnLifetime
	poolConfig.MaxConnIdleTime = cfg.MaxConnIdleTime
	poolConfig.HealthCheckPeriod = cfg.HealthCheckPeriod

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Verify the connection is alive before returning.
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Pool{pool}, nil
}

// Health checks whether the database connection is alive.
// Used by the health check endpoint to report database status.
func (p *Pool) Health(ctx context.Context) error {
	if err := p.Ping(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}
	return nil
}
