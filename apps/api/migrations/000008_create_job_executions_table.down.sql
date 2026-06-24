-- Reverses 000008_create_job_executions_table.up.sql
DROP INDEX IF EXISTS idx_job_executions_user_id_seq;
DROP INDEX IF EXISTS idx_job_executions_job_id_seq;
DROP TABLE IF EXISTS job_executions;