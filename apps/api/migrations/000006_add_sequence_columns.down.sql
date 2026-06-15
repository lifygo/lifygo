-- Reverses 000006_add_sequence_columns.up.sql

DROP INDEX IF EXISTS idx_email_logs_user_id_seq;
DROP INDEX IF EXISTS idx_api_keys_user_id_seq;

ALTER TABLE email_logs DROP COLUMN IF EXISTS seq;
ALTER TABLE api_keys   DROP COLUMN IF EXISTS seq;