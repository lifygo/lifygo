package model

// DashboardStats is the shape returned by GET /dashboard/stats.
// Aggregates everything needed for the overview page in one call —
// email counts, active jobs, API keys, SMTP setup status, and
// recent activity for a quick at-a-glance view.
type DashboardStats struct {
	TotalEmailsSent   int     `json:"total_emails_sent"`
	TotalEmailsFailed int     `json:"total_emails_failed"`
	SuccessRate       float64 `json:"success_rate"`
	ActiveJobs        int     `json:"active_jobs"`
	TotalAPIKeys      int     `json:"total_api_keys"`
	HasSMTPConfig     bool    `json:"has_smtp_config"`

	// RecentEmailLogs holds the last 5 email send attempts.
	RecentEmailLogs []EmailLog `json:"recent_email_logs"`

	// RecentJobs holds the last 5 jobs created.
	RecentJobs []Job `json:"recent_jobs"`
}
