-- Create the email_logs table.
-- Every call to POST /send and POST /send/otp creates one row here,
-- regardless of whether the send succeeded or failed.
-- Used to power GET /logs in the dashboard.
CREATE TABLE email_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    to_address      VARCHAR(255) NOT NULL,
    subject         VARCHAR(998) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    error_message   TEXT,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Status is constrained to known values. Application code maps
    -- these to the EmailStatus type in internal/model/email.go.
    CONSTRAINT chk_email_logs_status CHECK (status IN ('sent', 'failed'))
);

-- Composite index for GET /logs — queries always filter by user_id
-- and order by sent_at descending for pagination.
CREATE INDEX idx_email_logs_user_id_sent_at ON email_logs (user_id, sent_at DESC);

-- Index for filtering logs by status within a user's history
-- (e.g. "show me only failed sends").
CREATE INDEX idx_email_logs_user_id_status ON email_logs (user_id, status);