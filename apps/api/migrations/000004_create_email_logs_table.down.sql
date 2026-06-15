-- Reverses 000004_create_email_logs_table.up.sql
DROP INDEX IF EXISTS idx_email_logs_user_id_status;
DROP INDEX IF EXISTS idx_email_logs_user_id_sent_at;
DROP TABLE IF EXISTS email_logs;