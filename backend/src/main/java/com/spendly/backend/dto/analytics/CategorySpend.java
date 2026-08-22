package com.spendly.backend.dto.analytics;

import java.math.BigDecimal;
import java.util.UUID;

public record CategorySpend(
        UUID categoryId,
        String categoryName,
        String icon,
        BigDecimal spent,
        BigDecimal budgetLimit // null if no budget set for this category
) {
}