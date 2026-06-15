-- Create the users table.
-- Users authenticate via Clerk (Google or GitHub OAuth only).
-- No password is ever stored — Clerk owns all credentials.
-- clerk_user_id is the link between Clerk's identity and our internal user record.
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id   VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups when verifying Clerk session tokens.
CREATE INDEX idx_users_clerk_user_id ON users (clerk_user_id);