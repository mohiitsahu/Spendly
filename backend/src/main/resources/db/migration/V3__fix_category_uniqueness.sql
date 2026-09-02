-- The category name/type uniqueness constraint was scoped to (tenant_id,
-- name, type) only, missed when user_id was added in V2. This meant two
-- different users in the same tenant couldn't both have a category named
-- "Food" - the constraint needs to include user_id too, matching the same
-- per-user isolation V2 established everywhere else.

ALTER TABLE category DROP CONSTRAINT category_tenant_id_name_type_key;
ALTER TABLE category ADD CONSTRAINT category_tenant_user_name_type_key
    UNIQUE (tenant_id, user_id, name, type);