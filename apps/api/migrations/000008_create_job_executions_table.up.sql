-- Create the job_executions table.
-- Every time a job fires, one row is written here recording the outcome.
-- This is the audit trail — developers can see exactly what happened,
-- when it happened, and why it failed if it did.
CREATE TABLE job_executions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    -- Execution outcome: "success" or "failed"
    status          VARCHAR(20) NOT NULL,

    -- For webhook jobs: the HTTP status code returned by the target URL.
    -- NULL for email jobs or if connection failed before a response.
    http_status     INTEGER,

    -- Error detail if status is "failed".
    -- NULL if status is "success".
    error_message   TEXT,

    -- How long the execution took in milliseconds.
    duration_ms     INTEGER,

    -- Strictly increasing sequence for reliable ordering.
    -- See migration 000006 for why we use seq instead of executed_at.
    seq             BIGSERIAL,

    executed_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_job_executions_status CHECK (status IN ('success', 'failed'))
);

-- Composite index for listing executions for a specific job, newest first.
CREATE INDEX idx_job_executions_job_id_seq ON job_executions (job_id, seq DESC);

-- Index for listing all executions for a user across all jobs.
CREATE INDEX idx_job_executions_user_id_seq ON job_executions (user_id, seq DESC);