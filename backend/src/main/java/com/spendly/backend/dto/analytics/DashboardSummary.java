package com.spendly.backend.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummary(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netSavings,
        List<CategorySpend> categoryBreakdown // expense categories only, current month
) {
}