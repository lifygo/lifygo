-- Allow partial SMTP configs for free relay users.
-- Free users only set from_address — host/port/username/password are optional.
ALTER TABLE smtp_configs
    ALTER COLUMN host DROP NOT NULL,
    ALTER COLUMN port DROP NOT NULL,
    ALTER COLUMN username DROP NOT NULL,
    ALTER COLUMN password_encrypted DROP NOT NULL;

-- Drop the port range check so free users don't need a port.
ALTER TABLE smtp_configs DROP CONSTRAINT IF EXISTS chk_smtp_configs_port;
