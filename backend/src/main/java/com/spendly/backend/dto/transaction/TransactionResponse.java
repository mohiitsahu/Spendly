package com.spendly.backend.dto.transaction;

import com.spendly.backend.dto.category.CategoryResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        CategoryResponse category,
        BigDecimal amount,
        String currency,
        String note,
        Instant occurredAt
) {
}