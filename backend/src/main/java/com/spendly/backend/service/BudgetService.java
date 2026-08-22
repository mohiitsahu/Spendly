package com.spendly.backend.service;

import com.spendly.backend.dto.budget.BudgetRequest;
import com.spendly.backend.dto.budget.BudgetResponse;
import com.spendly.backend.dto.category.CategoryResponse;
import com.spendly.backend.entity.AppUser;
import com.spendly.backend.entity.Budget;
import com.spendly.backend.entity.Category;
import com.spendly.backend.exception.ResourceNotFoundException;
import com.spendly.backend.repository.AppUserRepository;
import com.spendly.backend.repository.BudgetRepository;
import com.spendly.backend.repository.CategoryRepository;
import com.spendly.backend.security.CurrentUserProvider;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final AppUserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public BudgetService(BudgetRepository budgetRepository, CategoryRepository categoryRepository,
                          AppUserRepository userRepository, CurrentUserProvider currentUserProvider) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request) {
        UUID tenantId = TenantContext.get();
        UUID userId = currentUserProvider.getCurrentUserId();

        Category category = categoryRepository.findByIdAndTenantIdAndUserId(request.categoryId(), tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setLimitAmount(request.limitAmount());
        budgetRepository.save(budget);

        return toResponse(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> listAll() {
        return budgetRepository.findAllByTenantIdAndUserId(TenantContext.get(), currentUserProvider.getCurrentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BudgetResponse update(UUID id, BudgetRequest request) {
        Budget budget = findOrThrow(id);
        UUID userId = currentUserProvider.getCurrentUserId();

        Category category = categoryRepository.findByIdAndTenantIdAndUserId(request.categoryId(), TenantContext.get(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        budget.setCategory(category);
        budget.setLimitAmount(request.limitAmount());

        return toResponse(budget);
    }

    @Transactional
    public void delete(UUID id) {
        Budget budget = findOrThrow(id);
        budgetRepository.delete(budget);
    }

    private Budget findOrThrow(UUID id) {
        return budgetRepository.findByIdAndTenantIdAndUserId(id, TenantContext.get(), currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
    }

    private BudgetResponse toResponse(Budget b) {
        CategoryResponse categoryResponse = new CategoryResponse(
                b.getCategory().getId(), b.getCategory().getName(), b.getCategory().getIcon(), b.getCategory().getType());
        return new BudgetResponse(b.getId(), categoryResponse, b.getPeriod(), b.getLimitAmount());
    }
}