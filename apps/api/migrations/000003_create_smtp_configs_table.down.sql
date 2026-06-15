-- Reverses 000003_create_smtp_configs_table.up.sql
DROP INDEX IF EXISTS idx_smtp_configs_user_id;
DROP TABLE IF EXISTS smtp_configs;