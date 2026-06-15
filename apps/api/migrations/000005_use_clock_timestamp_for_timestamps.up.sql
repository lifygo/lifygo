-- Change the default for all created_at / updated_at columns from
-- now() to clock_timestamp().
--
-- now() returns the time the CURRENT TRANSACTION started, and stays
-- the same for every statement inside that transaction.
--
-- clock_timestamp() returns the REAL current time, and is different
-- for every statement — even inside the same transaction.
--
-- Why this matters:
--   If two rows are inserted in the same transaction using now(),
--   they get the EXACT same created_at value. Then "ORDER BY created_at"
--   cannot tell which row was created first.
--
-- clock_timestamp() fixes this by always reflecting the true moment
-- each row was written.

ALTER TABLE users         ALTER COLUMN created_at SET DEFAULT clock_timestamp();
ALTER TABLE api_keys       ALTER COLUMN created_at SET DEFAULT clock_timestamp();
ALTER TABLE smtp_configs   ALTER COLUMN created_at SET DEFAULT clock_timestamp();
ALTER TABLE smtp_configs   ALTER COLUMN updated_at SET DEFAULT clock_timestamp();
ALTER TABLE email_logs     ALTER COLUMN sent_at    SET DEFAULT clock_timestamp();