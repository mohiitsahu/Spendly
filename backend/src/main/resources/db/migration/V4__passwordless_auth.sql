-- Moving to passwordless auth: email OTP + Google, unified by email.
-- Password-based accounts are dropped entirely - every user now has a
-- single identity keyed by email, reachable via either method.
--
-- Dropping password_hash automatically drops chk_app_user_has_credential
-- too, since that CHECK constraint referenced this column - no separate
-- DROP CONSTRAINT needed.

ALTER TABLE app_user DROP COLUMN password_hash;

-- Short-lived OTP challenges for email login, same pattern used for phone
-- OTP earlier in the project - never stores the raw code, only its hash.
CREATE TABLE email_otp_challenge (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    email           VARCHAR(255) NOT NULL,
    otp_hash        VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    attempt_count   INT NOT NULL DEFAULT 0,
    consumed        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_otp_challenge_email ON email_otp_challenge (tenant_id, email, consumed);