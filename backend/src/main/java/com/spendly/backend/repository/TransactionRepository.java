package com.spendly.backend.repository;

import com.spendly.backend.entity.CategoryType;
import com.spendly.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findAllByTenantIdAndUserIdOrderByOccurredAtDesc(
            UUID tenantId, UUID userId, Pageable pageable);

    Page<Transaction> findAllByTenantIdAndUserIdAndCategoryIdOrderByOccurredAtDesc(
            UUID tenantId, UUID userId, UUID categoryId, Pageable pageable);

    Page<Transaction> findAllByTenantIdAndUserIdAndOccurredAtBetweenOrderByOccurredAtDesc(
            UUID tenantId, UUID userId, Instant from, Instant to, Pageable pageable);

    Optional<Transaction> findByIdAndTenantIdAndUserId(UUID id, UUID tenantId, UUID userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.tenantId = :tenantId AND t.user.id = :userId AND t.category.type = :type " +
            "AND t.occurredAt >= :from AND t.occurredAt < :to")
    BigDecimal sumAmountByType(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId,
                               @Param("type") CategoryType type,
                               @Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT t.category.id, COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.tenantId = :tenantId AND t.user.id = :userId AND t.category.type = 'EXPENSE' " +
            "AND t.occurredAt >= :from AND t.occurredAt < :to GROUP BY t.category.id")
    List<Object[]> sumExpenseByCategory(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId,
                                         @Param("from") Instant from, @Param("to") Instant to);
}