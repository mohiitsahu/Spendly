package com.spendly.backend.repository;

import com.spendly.backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findAllByTenantIdAndUserId(UUID tenantId, UUID userId);

    Optional<Goal> findByIdAndTenantIdAndUserId(UUID id, UUID tenantId, UUID userId);
}