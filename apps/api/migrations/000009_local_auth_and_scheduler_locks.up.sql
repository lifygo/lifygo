-- 000009_local_auth_and_scheduler_locks.up.sql
-- Adds scheduler concurrency control and prepares schema for local authentication.

BEGIN;

-- Scheduler concurrency: track when a job was last picked up by a worker.
ALTER TABLE jobs
    ADD COLUMN last_run_at TIMESTAMPTZ DEFAULT NULL;

-- Index for the scheduler's ListActiveDue query.
-- This speeds up the CTE that selects + locks due jobs.
CREATE INDEX idx_jobs_scheduler_due
    ON jobs (status, enabled, last_run_at);

-- Local auth preparation: make clerk_user_id nullable.
ALTER TABLE users
    ALTER COLUMN clerk_user_id DROP NOT NULL;

-- Local auth: store hashed password for native sign-in.
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL;

COMMIT;