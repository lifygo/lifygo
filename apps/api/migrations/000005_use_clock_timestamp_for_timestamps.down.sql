-- Reverses 000005_use_clock_timestamp_for_timestamps.up.sql
-- Restores the original now()-based defaults.

ALTER TABLE users         ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE api_keys       ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE smtp_configs   ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE smtp_configs   ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE email_logs     ALTER COLUMN sent_at    SET DEFAULT now();