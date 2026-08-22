-- Data privacy fix: categories, budgets, and goals were only scoped by
-- tenant_id, meaning every account within a tenant shared the same data.
-- Adding user_id makes each user's data private to them, while tenant_id
-- remains the (still-unused) boundary for future multi-tenancy.

ALTER TABLE category ADD COLUMN user_id UUID REFERENCES app_user (id) ON DELETE CASCADE;
ALTER TABLE budget ADD COLUMN user_id UUID REFERENCES app_user (id) ON DELETE CASCADE;
ALTER TABLE goal ADD COLUMN user_id UUID REFERENCES app_user (id) ON DELETE CASCADE;

-- No existing data is worth preserving in dev, so these stay nullable at
-- the DB level for now; the application always sets them going forward.
-- (If this were production data, we'd backfill user_id before adding a
-- NOT NULL constraint instead of leaving it nullable.)

CREATE INDEX idx_category_tenant_user ON category (tenant_id, user_id);
CREATE INDEX idx_budget_tenant_user ON budget (tenant_id, user_id);
CREATE INDEX idx_goal_tenant_user ON goal (tenant_id, user_id);