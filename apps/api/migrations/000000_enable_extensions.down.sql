-- Reverses 000000_enable_extensions.up.sql
-- Note: only drop if no other database objects depend on it.
-- In practice this down migration is rarely run since dropping
-- pgcrypto would break every table's default UUID generation.
DROP EXTENSION IF EXISTS pgcrypto;