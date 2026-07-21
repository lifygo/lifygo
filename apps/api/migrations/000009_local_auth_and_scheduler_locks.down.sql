-- 000009_local_auth_and_scheduler_locks.down.sql

BEGIN;

ALTER TABLE users
    DROP COLUMN password_hash;

ALTER TABLE users
    ALTER COLUMN clerk_user_id SET NOT NULL;

DROP INDEX IF EXISTS idx_jobs_scheduler_due;

ALTER TABLE jobs
    DROP COLUMN last_run_at;

COMMIT;