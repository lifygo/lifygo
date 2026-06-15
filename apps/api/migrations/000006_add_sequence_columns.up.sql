-- Add a strictly increasing "seq" column to tables that need
-- reliable ordering (newest first).
--
-- Why we need this:
-- Even clock_timestamp() only has microsecond precision. If two rows
-- are inserted within the same microsecond, they get the same
-- created_at value, and "ORDER BY created_at" cannot tell which
-- one came first.
--
-- BIGSERIAL is a database sequence. Postgres hands out a new,
-- always-increasing number for every row, with zero chance of
-- two rows ever getting the same number — even under heavy load.
--
-- created_at is still used to SHOW the time to users.
-- seq is used only to ORDER rows correctly.

ALTER TABLE api_keys   ADD COLUMN seq BIGSERIAL;
ALTER TABLE email_logs ADD COLUMN seq BIGSERIAL;

-- These indexes speed up "give me this user's rows, newest first".
CREATE INDEX idx_api_keys_user_id_seq   ON api_keys   (user_id, seq DESC);
CREATE INDEX idx_email_logs_user_id_seq ON email_logs (user_id, seq DESC);