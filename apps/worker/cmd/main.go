package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lifygo/lifygo/apps/worker/internal/executor"
	"github.com/lifygo/lifygo/apps/worker/internal/resolver"
)

// SQSJobMessage is the shape of the message EventBridge drops into SQS.
// When we create a job in the API, we store the job ID.
// EventBridge passes that ID through SQS to Lambda, which then
// fetches the full job config from PostgreSQL.
type SQSJobMessage struct {
	JobID  string `json:"job_id"`
	UserID string `json:"user_id"`
}

// handler is the Lambda handler function.
// It is called once per SQS batch (up to 10 messages at a time).
// Each message contains a job ID — we fetch the job from PostgreSQL
// and execute it.
func handler(ctx context.Context, sqsEvent events.SQSEvent) error {
	// Connect to PostgreSQL on cold start.
	// Lambda reuses the connection pool across invocations within
	// the same execution environment, so this is efficient.
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer pool.Close()

	// Build the resolver (fetches job config from PostgreSQL)
	// and executor (runs the job).
	res := resolver.New(pool)
	enc := os.Getenv("ENCRYPTION_KEY")
	if enc == "" {
		return fmt.Errorf("ENCRYPTION_KEY environment variable is not set")
	}
	exec, err := executor.New(res, enc)
	if err != nil {
		return fmt.Errorf("failed to create executor: %w", err)
	}

	// Process each SQS message.
	for _, record := range sqsEvent.Records {
		var msg SQSJobMessage
		if err := json.Unmarshal([]byte(record.Body), &msg); err != nil {
			log.Printf("failed to parse SQS message: %v — skipping", err)
			continue
		}

		log.Printf("processing job_id=%s user_id=%s", msg.JobID, msg.UserID)

		if err := exec.Execute(ctx, msg.JobID, msg.UserID); err != nil {
			// Log the error but do not return it — returning an error
			// causes SQS to retry the entire batch. We handle per-job
			// failures inside executor.Execute by writing to job_executions.
			log.Printf("job execution failed job_id=%s: %v", msg.JobID, err)
		}
	}

	return nil
}

func main() {
	lambda.Start(handler)
}
