-- Enable required PostgreSQL extensions.
-- pgcrypto provides gen_random_uuid() used as the default for all
-- primary key columns across every table in this schema.
CREATE EXTENSION IF NOT EXISTS pgcrypto;