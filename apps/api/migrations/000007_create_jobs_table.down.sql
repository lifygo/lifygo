-- Reverses 000007_create_jobs_table.up.sql
DROP INDEX IF EXISTS idx_jobs_run_at;
DROP INDEX IF EXISTS idx_jobs_status_enabled;
DROP INDEX IF EXISTS idx_jobs_user_id;
DROP TABLE IF EXISTS jobs;