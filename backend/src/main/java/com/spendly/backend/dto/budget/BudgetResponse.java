package com.spendly.backend.dto.budget;

import com.spendly.backend.dto.category.CategoryResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        CategoryResponse category,
        String period,
        BigDecimal limitAmount
) {
}