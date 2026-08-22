package com.spendly.backend.repository;

import com.spendly.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findAllByTenantIdOrderByOccurredAtDesc(UUID tenantId, Pageable pageable);

    Page<Transaction> findAllByTenantIdAndCategoryIdOrderByOccurredAtDesc(
            UUID tenantId, UUID categoryId, Pageable pageable);

    Page<Transaction> findAllByTenantIdAndOccurredAtBetweenOrderByOccurredAtDesc(
            UUID tenantId, Instant from, Instant to, Pageable pageable);

    Optional<Transaction> findByIdAndTenantId(UUID id, UUID tenantId);
}