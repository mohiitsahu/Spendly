package com.spendly.backend.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Sets TenantContext for the lifetime of each request, then clears it.
 *
 * Single-tenant mode: every request uses spendly.default-tenant-id from config.
 * Multi-tenant mode (later): replace the body of this filter to pull tenant_id
 * from the authenticated JWT instead - nothing downstream needs to change.
 */
@Component
public class TenantResolvingFilter extends OncePerRequestFilter {

    private final UUID defaultTenantId;

    public TenantResolvingFilter(@Value("${spendly.default-tenant-id}") String defaultTenantId) {
        this.defaultTenantId = UUID.fromString(defaultTenantId);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            TenantContext.set(defaultTenantId);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}