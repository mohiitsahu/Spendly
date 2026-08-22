-- Spendly initial schema
-- Every table carries tenant_id from day one. In single-tenant mode, every row
-- uses the same fixed tenant_id (see application.yml: spendly.default-tenant-id).
-- This means going multi-tenant later is an auth + query-scoping change,
-- not a schema migration.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE app_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),         -- NULL if the user only ever signed in via Google
    google_id       VARCHAR(255) UNIQUE,  -- NULL if the user only uses email/password
    display_name    VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_app_user_has_credential CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);
CREATE INDEX idx_app_user_tenant ON app_user (tenant_id);

CREATE TABLE category (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(80) NOT NULL,
    icon            VARCHAR(60),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, name, type)
);
CREATE INDEX idx_category_tenant ON category (tenant_id);

CREATE TABLE transaction (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES category (id),
    amount          NUMERIC(14, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    note            VARCHAR(280),
    occurred_at     TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transaction_tenant ON transaction (tenant_id);
CREATE INDEX idx_transaction_tenant_user ON transaction (tenant_id, user_id);
CREATE INDEX idx_transaction_tenant_occurred ON transaction (tenant_id, occurred_at DESC);
CREATE INDEX idx_transaction_category ON transaction (category_id);

CREATE TABLE budget (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    category_id     UUID NOT NULL REFERENCES category (id),
    period          VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (period IN ('MONTHLY')),
    limit_amount    NUMERIC(14, 2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, category_id, period)
);
CREATE INDEX idx_budget_tenant ON budget (tenant_id);

CREATE TABLE goal (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(120) NOT NULL,
    target_amount   NUMERIC(14, 2) NOT NULL,
    saved_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    deadline        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_goal_tenant ON goal (tenant_id);