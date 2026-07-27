package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type DBExecutor interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

const postgresUniqueViolationCode = "23505"

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if ok := asPgError(err, &pgErr); ok {
		return pgErr.Code == postgresUniqueViolationCode
	}
	return false
}

func asPgError(err error, target **pgconn.PgError) bool {
	pgErr, ok := err.(*pgconn.PgError)
	if ok {
		*target = pgErr
		return true
	}
	return false
}
