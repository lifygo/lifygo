-- Create the api_keys table.
-- Each user can generate multiple named API keys for programmatic access.
-- The raw key is shown to the user exactly once at creation time.
-- Only the SHA-256 hash is stored — used to authenticate X-API-Key headers.
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    key_hash        VARCHAR(64) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups when authenticating incoming requests.
-- Every authenticated request hashes the provided key and looks it up here.
CREATE INDEX idx_api_keys_key_hash ON api_keys (key_hash);

-- Index for listing all keys belonging to a user (dashboard view).
CREATE INDEX idx_api_keys_user_id ON api_keys (user_id);