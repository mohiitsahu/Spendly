package com.spendly.backend.dto.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetRequest(
        @NotNull UUID categoryId,
        @NotNull @DecimalMin(value = "0.01", message = "Limit must be greater than 0") BigDecimal limitAmount
) {
}