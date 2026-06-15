//go:build integration

// This file is only built when we run tests with the "integration" tag.
// Normal tests (go test ./...) skip this file completely, because these
// tests need a real PostgreSQL database to be running (via Docker).
//
// To run these tests:
//   go test -tags=integration ./internal/repository/... -v -race -count=1

package repository_test

import (
	"context"
	"fmt"
	"math/rand"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/repository"
)

// testDatabaseURL returns the connection string for the test database.
// By default it points at the local Docker Postgres from docker-compose.
// Set TEST_DATABASE_URL to override this (for example, in CI).
func testDatabaseURL() string {
	return "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable"
}

// newTestPool opens a connection pool to the test database.
// t.Cleanup makes sure the pool is closed automatically when the
// test finishes, even if the test fails.
func newTestPool(t *testing.T) *pgxpool.Pool {
	t.Helper()

	pool, err := pgxpool.New(context.Background(), testDatabaseURL())
	if err != nil {
		t.Fatalf("failed to create test pool: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	t.Cleanup(pool.Close)

	return pool
}

// beginTx starts a new database transaction for a single test.
//
// Why we do this:
// Every test runs inside its own transaction. At the end of the test,
// we always roll back — so nothing the test created, changed, or deleted
// is ever saved for real. This means:
//   - Tests never leave junk data behind.
//   - Tests never interfere with each other.
//   - We never need to manually clean up tables.
func beginTx(t *testing.T, pool *pgxpool.Pool) pgx.Tx {
	t.Helper()

	tx, err := pool.Begin(context.Background())
	if err != nil {
		t.Fatalf("failed to begin transaction: %v", err)
	}

	t.Cleanup(func() {
		_ = tx.Rollback(context.Background())
	})

	return tx
}

// randomSuffix returns a short random number as a string.
// Used to make test emails and IDs unique, so tests don't clash
// with each other even if they run at the same time.
func randomSuffix() string {
	return fmt.Sprintf("%d", rand.Intn(1_000_000_000))
}

// insertTestUser creates a user row directly in the database and
// returns the created user. Used by tests in this package (and other
// repository tests later) that need an existing user to work with.
func insertTestUser(t *testing.T, tx pgx.Tx) *model.User {
	t.Helper()

	repo := repository.NewUserRepository(tx)

	input := model.CreateUserInput{
		ClerkUserID: "clerk_test_" + randomSuffix(),
		Name:        "Test User",
		Email:       "test_" + randomSuffix() + "@example.com",
	}

	user, err := repo.Create(context.Background(), input)
	if err != nil {
		t.Fatalf("failed to insert test user: %v", err)
	}

	return user
}

// insertTestAPIKey creates an api_key row for the given user and
// returns the created key. Used by tests that need an existing
// api key to work with.
func insertTestAPIKey(t *testing.T, tx pgx.Tx, userID string) *model.APIKey {
	t.Helper()

	repo := repository.NewAPIKeyRepository(tx)

	key, err := repo.Create(context.Background(), userID, "hash_"+randomSuffix(), "test-key")
	if err != nil {
		t.Fatalf("failed to insert test api key: %v", err)
	}

	return key
}
