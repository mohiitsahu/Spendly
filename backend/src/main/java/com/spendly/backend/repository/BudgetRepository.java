package com.spendly.backend.repository;

import com.spendly.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findAllByTenantId(UUID tenantId);

    Optional<Budget> findByTenantIdAndCategoryId(UUID tenantId, UUID categoryId);
}