package com.spendly.backend.entity;

import com.spendly.backend.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class TenantScopedEntity {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Every entity is stamped with the request's current tenant automatically -
     * no service is trusted to remember to set tenant_id by hand. This is the
     * safety net against the classic "forgot the WHERE tenant_id" bug class.
     */
    @PrePersist
    protected void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (tenantId == null) {
            tenantId = TenantContext.get();
        }
    }
}