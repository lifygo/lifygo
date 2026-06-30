package model

// DashboardStats is the shape returned by GET /dashboard/stats.
// Aggregates everything needed for the overview page in one call —
// email counts, active jobs, API keys, and SMTP setup status.
type DashboardStats struct {
	TotalEmailsSent   int     `json:"total_emails_sent"`
	TotalEmailsFailed int     `json:"total_emails_failed"`
	SuccessRate       float64 `json:"success_rate"`
	ActiveJobs        int     `json:"active_jobs"`
	TotalAPIKeys      int     `json:"total_api_keys"`
	HasSMTPConfig     bool    `json:"has_smtp_config"`
}
