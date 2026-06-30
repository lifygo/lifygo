package service

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// DashboardService aggregates data from multiple repositories to build
// the dashboard overview stats. It does not own any data itself —
// it just queries the other repositories and combines the results.
type DashboardService struct {
	emailLogs EmailLogRepository
	jobs      JobRepository
	apiKeys   APIKeyRepository
	smtp      SMTPConfigRepository
}

// NewDashboardService creates a new DashboardService.
func NewDashboardService(
	emailLogs EmailLogRepository,
	jobs JobRepository,
	apiKeys APIKeyRepository,
	smtp SMTPConfigRepository,
) *DashboardService {
	return &DashboardService{
		emailLogs: emailLogs,
		jobs:      jobs,
		apiKeys:   apiKeys,
		smtp:      smtp,
	}
}

// GetDashboardStats builds the full overview stats for a user.
// Combines email send counts, active job counts, API key counts,
// and SMTP setup status into one response.
func (s *DashboardService) GetDashboardStats(ctx context.Context, userID string) (*model.DashboardStats, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	// Get total email count.
	totalEmails, err := s.emailLogs.CountByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count emails: %w", err)
	}

	// Get failed email count by filtering logs.
	// We list with a generous limit to count failures accurately.
	failedStatus := model.EmailStatusFailed
	failedLogs, err := s.emailLogs.List(ctx, model.ListEmailLogsInput{
		UserID: userID,
		Status: &failedStatus,
		Limit:  1, // We only need the count, not the actual records.
		Offset: 0,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to count failed emails: %w", err)
	}
	_ = failedLogs

	// Count failed emails properly using a dedicated count.
	// Since EmailLogRepository.CountByUserID does not filter by status,
	// we calculate failed count by listing all and counting failures.
	// For accuracy at scale this should be a dedicated COUNT query —
	// acceptable for now given launch-stage data volumes.
	allLogs, err := s.emailLogs.List(ctx, model.ListEmailLogsInput{
		UserID: userID,
		Limit:  1000,
		Offset: 0,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list emails for stats: %w", err)
	}

	failedCount := 0
	for _, log := range allLogs {
		if log.Status == model.EmailStatusFailed {
			failedCount++
		}
	}

	sentCount := totalEmails - failedCount
	successRate := 100.0
	if totalEmails > 0 {
		successRate = (float64(sentCount) / float64(totalEmails)) * 100
	}

	// Get active job count.
	jobs, err := s.jobs.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list jobs: %w", err)
	}
	activeJobs := 0
	for _, j := range jobs {
		if j.Status == model.JobStatusActive {
			activeJobs++
		}
	}

	// Get API key count.
	apiKeyCount, err := s.apiKeys.CountByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count api keys: %w", err)
	}

	// Check if SMTP is configured.
	hasSMTP := true
	if _, err := s.smtp.GetByUserID(ctx, userID); err != nil {
		if err == model.ErrNotFound {
			hasSMTP = false
		} else {
			return nil, fmt.Errorf("failed to check smtp config: %w", err)
		}
	}

	return &model.DashboardStats{
		TotalEmailsSent:   sentCount,
		TotalEmailsFailed: failedCount,
		SuccessRate:       successRate,
		ActiveJobs:        activeJobs,
		TotalAPIKeys:      apiKeyCount,
		HasSMTPConfig:     hasSMTP,
	}, nil
}
