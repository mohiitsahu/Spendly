package com.spendly.backend.repository;

import com.spendly.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findAllByTenantIdAndUserId(UUID tenantId, UUID userId);

    Optional<Budget> findByIdAndTenantIdAndUserId(UUID id, UUID tenantId, UUID userId);

    Optional<Budget> findByTenantIdAndUserIdAndCategoryId(UUID tenantId, UUID userId, UUID categoryId);
}