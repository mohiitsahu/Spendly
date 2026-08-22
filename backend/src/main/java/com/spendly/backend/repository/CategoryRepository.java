package com.spendly.backend.repository;

import com.spendly.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findAllByTenantId(UUID tenantId);

    Optional<Category> findByIdAndTenantId(UUID id, UUID tenantId);
}