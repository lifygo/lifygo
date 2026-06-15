-- Create the smtp_configs table.
-- Each user has at most one SMTP configuration — LifyGo never owns
-- the sending infrastructure, every user brings their own SMTP server.
-- The password is encrypted with AES-256 before storage (see pkg/crypto)
-- and decrypted only at the moment of sending an email.
CREATE TABLE smtp_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    host                VARCHAR(255) NOT NULL,
    port                INTEGER NOT NULL,
    username            VARCHAR(255) NOT NULL,
    password_encrypted  TEXT NOT NULL,
    from_address        VARCHAR(255) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One SMTP configuration per user. Creating a new one replaces
    -- the existing one via upsert (ON CONFLICT) in the repository layer.
    CONSTRAINT uq_smtp_configs_user_id UNIQUE (user_id),

    -- Port must be a valid TCP port number.
    CONSTRAINT chk_smtp_configs_port CHECK (port > 0 AND port <= 65535)
);

-- Index for fast lookup when sending an email — every send operation
-- fetches the user's SMTP config by user_id.
CREATE INDEX idx_smtp_configs_user_id ON smtp_configs (user_id);