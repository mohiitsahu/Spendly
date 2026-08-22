package com.spendly.backend.service;

import com.spendly.backend.dto.analytics.CategorySpend;
import com.spendly.backend.dto.analytics.DashboardSummary;
import com.spendly.backend.entity.Budget;
import com.spendly.backend.entity.Category;
import com.spendly.backend.entity.CategoryType;
import com.spendly.backend.repository.BudgetRepository;
import com.spendly.backend.repository.CategoryRepository;
import com.spendly.backend.repository.TransactionRepository;
import com.spendly.backend.security.CurrentUserProvider;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final CurrentUserProvider currentUserProvider;

    public AnalyticsService(TransactionRepository transactionRepository, CategoryRepository categoryRepository,
                             BudgetRepository budgetRepository, CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public DashboardSummary getDashboardSummary() {
        UUID tenantId = TenantContext.get();
        UUID userId = currentUserProvider.getCurrentUserId();

        LocalDate today = LocalDate.now();
        Instant monthStart = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant monthEnd = today.with(TemporalAdjusters.firstDayOfNextMonth()).atStartOfDay(ZoneOffset.UTC).toInstant();

        BigDecimal totalIncome = transactionRepository.sumAmountByType(tenantId, userId, CategoryType.INCOME, monthStart, monthEnd);
        BigDecimal totalExpense = transactionRepository.sumAmountByType(tenantId, userId, CategoryType.EXPENSE, monthStart, monthEnd);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        List<Object[]> spendRows = transactionRepository.sumExpenseByCategory(tenantId, userId, monthStart, monthEnd);
        Map<UUID, BigDecimal> spendByCategory = new HashMap<>();
        for (Object[] row : spendRows) {
            spendByCategory.put((UUID) row[0], (BigDecimal) row[1]);
        }

        List<Budget> budgets = budgetRepository.findAllByTenantIdAndUserId(tenantId, userId);
        Map<UUID, BigDecimal> budgetByCategory = new HashMap<>();
        for (Budget b : budgets) {
            budgetByCategory.put(b.getCategory().getId(), b.getLimitAmount());
        }

        List<Category> expenseCategories = categoryRepository.findAllByTenantIdAndUserId(tenantId, userId).stream()
                .filter(c -> c.getType() == CategoryType.EXPENSE)
                .toList();

        List<CategorySpend> breakdown = expenseCategories.stream()
                .map(c -> new CategorySpend(
                        c.getId(),
                        c.getName(),
                        c.getIcon(),
                        spendByCategory.getOrDefault(c.getId(), BigDecimal.ZERO),
                        budgetByCategory.get(c.getId())
                ))
                .toList();

        return new DashboardSummary(totalIncome, totalExpense, netSavings, breakdown);
    }
}