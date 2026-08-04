ALTER TABLE smtp_configs
    ALTER COLUMN host SET NOT NULL,
    ALTER COLUMN port SET NOT NULL,
    ALTER COLUMN username SET NOT NULL,
    ALTER COLUMN password_encrypted SET NOT NULL;

ALTER TABLE smtp_configs ADD CONSTRAINT chk_smtp_configs_port CHECK (port > 0 AND port <= 65535);
