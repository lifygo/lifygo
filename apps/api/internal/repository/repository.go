package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// DBExecutor is the small set of database operations every repository needs.
// Both *pgxpool.Pool (the real connection pool) and pgx.Tx (a transaction
// used in tests) satisfy this interface. This lets us:
//   - Use the real pool in production.
//   - Use a transaction in integration tests, so every test can roll back
//     and leave the database clean for the next test.
type DBExecutor interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

// postgresUniqueViolationCode is the error code Postgres returns when
// a row violates a UNIQUE constraint (for example, the same email
// being inserted twice).
const postgresUniqueViolationCode = "23505"

// isUniqueViolation checks if an error is a Postgres "unique_violation".
// We use this to turn a raw database error into a clean, expected
// model.ErrAlreadyExists error that the service layer can handle.
func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if ok := asPgError(err, &pgErr); ok {
		return pgErr.Code == postgresUniqueViolationCode
	}
	return false
}

// asPgError safely checks if err is (or wraps) a *pgconn.PgError
// and, if so, copies it into target.
func asPgError(err error, target **pgconn.PgError) bool {
	pgErr, ok := err.(*pgconn.PgError)
	if ok {
		*target = pgErr
		return true
	}
	return false
}
