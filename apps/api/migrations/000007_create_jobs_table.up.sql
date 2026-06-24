-- Create the jobs table.
-- Each row represents a scheduled job created by a developer.
-- A job can be one of two types:
--   webhook → LifyGo hits a URL at the scheduled time
--   email   → LifyGo sends an email at the scheduled time
--
-- Schedule can be one of two formats:
--   cron     → a standard cron expression (e.g. "0 9 * * 1")
--   one_time → a specific UTC datetime for a single execution
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    -- Human-readable name for the job.
    name            VARCHAR(255) NOT NULL,

    -- Job type: "webhook" or "email"
    type            VARCHAR(20) NOT NULL,

    -- Schedule type: "cron" or "one_time"
    schedule_type   VARCHAR(20) NOT NULL,

    -- Cron expression (e.g. "0 9 * * 1") — set when schedule_type is "cron".
    -- NULL when schedule_type is "one_time".
    cron_expression VARCHAR(100),

    -- UTC datetime for one-time execution — set when schedule_type is "one_time".
    -- NULL when schedule_type is "cron".
    run_at          TIMESTAMPTZ,

    -- For webhook jobs: the URL to hit.
    -- NULL for email jobs.
    webhook_url     TEXT,

    -- For webhook jobs: optional JSON payload to send.
    -- NULL for email jobs.
    webhook_payload TEXT,

    -- For email jobs: recipient address.
    -- NULL for webhook jobs.
    email_to        VARCHAR(255),

    -- For email jobs: email subject.
    -- NULL for webhook jobs.
    email_subject   VARCHAR(998),

    -- For email jobs: email body.
    -- NULL for webhook jobs.
    email_body      TEXT,

    -- Job status: "active", "paused", "completed" (for one-time jobs), "failed"
    status          VARCHAR(20) NOT NULL DEFAULT 'active',

    -- Whether the job is enabled or not.
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_jobs_type CHECK (type IN ('webhook', 'email')),
    CONSTRAINT chk_jobs_schedule_type CHECK (schedule_type IN ('cron', 'one_time')),
    CONSTRAINT chk_jobs_status CHECK (status IN ('active', 'paused', 'completed', 'failed'))
);

-- Index for listing all jobs belonging to a user.
CREATE INDEX idx_jobs_user_id ON jobs (user_id);

-- Index for the scheduler worker — it polls for active jobs that are due.
CREATE INDEX idx_jobs_status_enabled ON jobs (status, enabled);

-- Index for one-time jobs — scheduler needs to find jobs due at a specific time.
CREATE INDEX idx_jobs_run_at ON jobs (run_at) WHERE run_at IS NOT NULL;