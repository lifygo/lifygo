package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/scheduler"
	"github.com/aws/aws-sdk-go-v2/service/scheduler/types"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// EventBridgeConfig holds the AWS credentials and resource ARNs
// needed to create and delete EventBridge Scheduler rules.
// All fields are optional — if not provided, EventBridge is disabled
// and the self-hosted scheduler handles all job execution.
type EventBridgeConfig struct {
	Region           string
	AccessKeyID      string
	SecretAccessKey  string
	SQSQueueURL      string
	SQSQueueARN      string
	SchedulerRoleARN string
}

// sqsJobMessage is the payload sent to SQS when EventBridge fires.
// Lambda reads this to know which job to execute.
type sqsJobMessage struct {
	JobID  string `json:"job_id"`
	UserID string `json:"user_id"`
}

// EventBridgeService creates and deletes AWS EventBridge Scheduler rules.
// Each job in PostgreSQL maps to one rule in EventBridge.
// When the rule fires, it drops a message into SQS which triggers Lambda.
type EventBridgeService struct {
	client           *scheduler.Client
	sqsQueueARN      string
	schedulerRoleARN string
}

// NewEventBridgeService creates a new EventBridgeService from the given config.
// Returns nil if AWS credentials are not configured — callers must
// check for nil before using this service.
//
// Returning nil instead of an error is intentional:
// it signals "EventBridge is disabled" rather than "something went wrong".
// The job service checks for nil and falls back to self-hosted execution.
func NewEventBridgeService(cfg EventBridgeConfig) *EventBridgeService {
	// If any required AWS field is missing, EventBridge is disabled.
	if cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" ||
		cfg.SQSQueueARN == "" || cfg.SchedulerRoleARN == "" {
		return nil
	}

	// Build an AWS config with explicit credentials.
	// We use explicit credentials rather than the default credential chain
	// so the application behaves predictably regardless of what AWS
	// credentials are configured on the host machine.
	awsCfg, err := awsconfig.LoadDefaultConfig(
		context.Background(),
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.AccessKeyID,
				cfg.SecretAccessKey,
				"",
			),
		),
	)
	if err != nil {
		return nil
	}

	return &EventBridgeService{
		client:           scheduler.NewFromConfig(awsCfg),
		sqsQueueARN:      cfg.SQSQueueARN,
		schedulerRoleARN: cfg.SchedulerRoleARN,
	}
}

// CreateSchedule creates an EventBridge Scheduler rule for a job.
// The rule fires according to the job's schedule and sends a message
// to SQS containing the job_id and user_id.
// Lambda picks up the SQS message and executes the job.
func (s *EventBridgeService) CreateSchedule(ctx context.Context, job *model.Job) error {
	// Build the schedule expression in the format EventBridge expects.
	scheduleExpr, err := buildScheduleExpression(job)
	if err != nil {
		return fmt.Errorf("failed to build schedule expression: %w", err)
	}

	// Build the SQS message payload that Lambda will receive.
	payload, err := json.Marshal(sqsJobMessage{
		JobID:  job.ID,
		UserID: job.UserID,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal sqs payload: %w", err)
	}

	// Rule names must be unique within an account + region.
	// We use the job ID as the rule name so we can find and delete
	// it later without storing the rule ARN in our database.
	ruleName := scheduleRuleName(job.ID)

	input := &scheduler.CreateScheduleInput{
		Name:               aws.String(ruleName),
		ScheduleExpression: aws.String(scheduleExpr),

		// FlexibleTimeWindow allows EventBridge to fire the rule
		// within a time window rather than at an exact second.
		// OFF means fire at the exact scheduled time.
		FlexibleTimeWindow: &types.FlexibleTimeWindow{
			Mode: types.FlexibleTimeWindowModeOff,
		},

		// The target is our SQS queue.
		// EventBridge will POST the payload to this queue when the rule fires.
		Target: &types.Target{
			Arn:     aws.String(s.sqsQueueARN),
			RoleArn: aws.String(s.schedulerRoleARN),
			Input:   aws.String(string(payload)),
		},

		// For one-time jobs, delete the rule automatically after it fires.
		// For cron jobs, keep the rule alive indefinitely.
		ActionAfterCompletion: actionAfterCompletion(job),

		// All schedules use UTC to avoid timezone confusion.
		ScheduleExpressionTimezone: aws.String("UTC"),
	}

	if _, err := s.client.CreateSchedule(ctx, input); err != nil {
		return fmt.Errorf("failed to create eventbridge schedule: %w", err)
	}

	return nil
}

// DeleteSchedule removes the EventBridge Scheduler rule for a job.
// Called when a developer deletes a job via DELETE /jobs/{id}.
// If the rule does not exist (already deleted or never created),
// we return nil — idempotent deletion is safe here.
func (s *EventBridgeService) DeleteSchedule(ctx context.Context, jobID string) error {
	ruleName := scheduleRuleName(jobID)

	_, err := s.client.DeleteSchedule(ctx, &scheduler.DeleteScheduleInput{
		Name: aws.String(ruleName),
	})

	if err != nil {
		// If the rule doesn't exist, that's fine — treat it as already deleted.
		if strings.Contains(err.Error(), "ResourceNotFoundException") {
			return nil
		}
		return fmt.Errorf("failed to delete eventbridge schedule: %w", err)
	}

	return nil
}

// buildScheduleExpression converts a LifyGo job schedule into the
// AWS EventBridge Scheduler expression format.
//
// Two formats are supported:
//
//	Cron jobs:     "cron(0 9 ? * 2 *)"  — AWS requires 6 fields and ? for wildcards
//	One-time jobs: "at(2026-01-01T09:00:00)" — fires once at the exact UTC time
func buildScheduleExpression(job *model.Job) (string, error) {
	switch job.ScheduleType {
	case model.JobScheduleTypeCron:
		if job.CronExpression == nil {
			return "", fmt.Errorf("cron expression is nil")
		}
		// Convert standard 5-field cron to AWS 6-field cron format.
		awsCron, err := convertToAWSCron(*job.CronExpression)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("cron(%s)", awsCron), nil

	case model.JobScheduleTypeOneTime:
		if job.RunAt == nil {
			return "", fmt.Errorf("run_at is nil")
		}
		// AWS at() format: at(yyyy-mm-ddThh:mm:ss) in UTC.
		return fmt.Sprintf("at(%s)", job.RunAt.UTC().Format("2006-01-02T15:04:05")), nil

	default:
		return "", fmt.Errorf("unknown schedule type: %s", job.ScheduleType)
	}
}

// convertToAWSCron converts a standard 5-field cron expression
// to the 6-field format that AWS EventBridge Scheduler requires.
//
// Standard cron (5 fields): minute hour dom month dow
// AWS cron (6 fields):       minute hour dom month dow year
//
// AWS also requires that either DOM or DOW is "?" (not both specified).
// When DOW is specified, DOM must be "?", and vice versa.
//
// Example conversions:
//
//	"0 9 * * 1"   → "0 9 ? * 2 *"   (every Monday at 9am)
//	"0 0 1 * *"   → "0 0 1 * ? *"   (first of every month)
//	"* * * * *"   → "* * ? * * *"   (every minute)
func convertToAWSCron(expr string) (string, error) {
	parts := strings.Fields(expr)
	if len(parts) != 5 {
		return "", fmt.Errorf("expected 5-field cron expression, got %d fields", len(parts))
	}

	minute := parts[0]
	hour := parts[1]
	dom := parts[2]
	month := parts[3]
	dow := parts[4]

	// AWS requires one of DOM or DOW to be "?" when the other is specified.
	// Rule: if DOW is not "*", set DOM to "?". Otherwise if DOM is not "*",
	// set DOW to "?". If both are "*", set DOW to "*" and DOM to "?".
	if dow != "*" {
		// DOW is specified — AWS uses 1=Sunday, 2=Monday ... 7=Saturday
		// Standard cron uses 0=Sunday, 1=Monday ... 6=Saturday
		// We shift each numeric value by +1.
		dow = shiftCronDOW(dow)
		dom = "?"
	} else if dom != "*" {
		dow = "?"
	} else {
		dom = "?"
	}

	// Append year field — "*" means every year.
	return fmt.Sprintf("%s %s %s %s %s *", minute, hour, dom, month, dow), nil
}

// shiftCronDOW shifts day-of-week values from standard cron (0-6, Sun=0)
// to AWS cron format (1-7, Sun=1) for numeric values.
// Non-numeric values (*, ?, L, #) are passed through unchanged.
func shiftCronDOW(dow string) string {
	// Handle comma-separated values e.g. "1,3,5"
	parts := strings.Split(dow, ",")
	shifted := make([]string, 0, len(parts))

	for _, part := range parts {
		// Handle ranges e.g. "1-5"
		if strings.Contains(part, "-") {
			rangeParts := strings.SplitN(part, "-", 2)
			start := shiftSingleDOW(rangeParts[0])
			end := shiftSingleDOW(rangeParts[1])
			shifted = append(shifted, start+"-"+end)
			continue
		}
		shifted = append(shifted, shiftSingleDOW(part))
	}

	return strings.Join(shifted, ",")
}

// shiftSingleDOW shifts a single DOW value by +1 if it is numeric.
func shiftSingleDOW(val string) string {
	switch val {
	case "0":
		return "1"
	case "1":
		return "2"
	case "2":
		return "3"
	case "3":
		return "4"
	case "4":
		return "5"
	case "5":
		return "6"
	case "6":
		return "7"
	default:
		return val
	}
}

// actionAfterCompletion returns the EventBridge action to take after
// a schedule fires. One-time jobs are deleted automatically after firing.
// Cron jobs are kept alive.
func actionAfterCompletion(job *model.Job) types.ActionAfterCompletion {
	if job.ScheduleType == model.JobScheduleTypeOneTime {
		return types.ActionAfterCompletionDelete
	}
	return types.ActionAfterCompletionNone
}

// scheduleRuleName returns the EventBridge rule name for a job.
// Uses the job ID as the rule name so we can find and delete it
// without storing the rule ARN in our database.
// Format: "lifygo-job-{job_id}"
func scheduleRuleName(jobID string) string {
	return fmt.Sprintf("lifygo-job-%s", jobID)
}
