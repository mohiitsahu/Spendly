package com.spendly.backend.tenant;

import java.util.UUID;

/**
 * Holds the "current tenant" for the duration of a single request.
 *
 * Today (single-tenant mode), every request resolves to the same fixed
 * tenant id, set by TenantResolvingFilter from application config.
 *
 * When multi-tenancy ships, only TenantResolvingFilter changes (it will read
 * tenant_id from the authenticated user's JWT claims instead of config).
 * Every service/repository that calls TenantContext.get() keeps working
 * unmodified - that's the whole point of introducing this now.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(UUID tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static UUID get() {
        UUID tenantId = CURRENT_TENANT.get();
        if (tenantId == null) {
            throw new IllegalStateException(
                "No tenant set on this thread - TenantResolvingFilter must run before any service/repository access.");
        }
        return tenantId;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}