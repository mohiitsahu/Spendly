package com.spendly.backend.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionRequest(
        @NotNull UUID categoryId,
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be greater than 0") BigDecimal amount,
        @Size(max = 280) String note,
        @NotNull Instant occurredAt
) {
}