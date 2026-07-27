package repository

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

type EmailLogRepository struct {
	db DBExecutor
}

func NewEmailLogRepository(db DBExecutor) *EmailLogRepository {
	return &EmailLogRepository{db: db}
}

func (r *EmailLogRepository) Create(ctx context.Context, userID, to, subject string, status model.EmailStatus, errorMessage *string) (*model.EmailLog, error) {
	const query = `
        INSERT INTO email_logs (user_id, to_address, subject, status, error_message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, to_address, subject, status, error_message, sent_at
    `

	var log model.EmailLog
	err := r.db.QueryRow(ctx, query, userID, to, subject, status, errorMessage).Scan(
		&log.ID,
		&log.UserID,
		&log.To,
		&log.Subject,
		&log.Status,
		&log.ErrorMessage,
		&log.SentAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create email log: %w", err)
	}

	return &log, nil
}

func (r *EmailLogRepository) List(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, error) {
	args := []any{input.UserID, input.Limit, input.Offset}

	query := `
        SELECT id, user_id, to_address, subject, status, error_message, sent_at
        FROM email_logs
        WHERE user_id = $1
    `

	if input.Status != nil {
		query += ` AND status = $4`
		args = append(args, *input.Status)
	}

	query += ` ORDER BY seq DESC LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list email logs: %w", err)
	}
	defer rows.Close()

	logs := make([]model.EmailLog, 0)
	for rows.Next() {
		var log model.EmailLog
		if err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.To,
			&log.Subject,
			&log.Status,
			&log.ErrorMessage,
			&log.SentAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan email log row: %w", err)
		}
		logs = append(logs, log)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading email log rows: %w", err)
	}

	return logs, nil
}

func (r *EmailLogRepository) CountByUserID(ctx context.Context, userID string) (int, error) {
	const query = `SELECT COUNT(*) FROM email_logs WHERE user_id = $1`

	var count int
	if err := r.db.QueryRow(ctx, query, userID).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count email logs: %w", err)
	}

	return count, nil
}
