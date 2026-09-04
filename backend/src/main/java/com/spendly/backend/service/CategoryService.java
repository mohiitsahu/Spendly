package com.spendly.backend.service;

import com.spendly.backend.dto.category.CategoryRequest;
import com.spendly.backend.dto.category.CategoryResponse;
import com.spendly.backend.entity.AppUser;
import com.spendly.backend.entity.Category;
import com.spendly.backend.exception.ResourceNotFoundException;
import com.spendly.backend.repository.AppUserRepository;
import com.spendly.backend.repository.BudgetRepository;
import com.spendly.backend.repository.CategoryRepository;
import com.spendly.backend.repository.TransactionRepository;
import com.spendly.backend.security.CurrentUserProvider;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AppUserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CurrentUserProvider currentUserProvider;

    public CategoryService(CategoryRepository categoryRepository, AppUserRepository userRepository,
                            TransactionRepository transactionRepository, BudgetRepository budgetRepository,
                            CurrentUserProvider currentUserProvider) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        AppUser user = userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = new Category();
        category.setUser(user);
        category.setName(request.name());
        category.setIcon(request.icon());
        category.setType(request.type());
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAllByTenantIdAndUserId(TenantContext.get(), currentUserProvider.getCurrentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = findOrThrow(id);
        category.setName(request.name());
        category.setIcon(request.icon());
        category.setType(request.type());
        return toResponse(category);
    }

    @Transactional
    public void delete(UUID id) {
        Category category = findOrThrow(id);
        UUID tenantId = TenantContext.get();
        UUID userId = currentUserProvider.getCurrentUserId();

        boolean hasTransactions = transactionRepository.existsByTenantIdAndUserIdAndCategoryId(tenantId, userId, id);
        if (hasTransactions) {
            throw new IllegalArgumentException(
                    "Can't delete \"" + category.getName() + "\" - it still has transactions. Delete those first.");
        }

        boolean hasBudget = budgetRepository.findByTenantIdAndUserIdAndCategoryId(tenantId, userId, id).isPresent();
        if (hasBudget) {
            throw new IllegalArgumentException(
                    "Can't delete \"" + category.getName() + "\" - it still has a budget. Delete that first.");
        }

        categoryRepository.delete(category);
    }

    private Category findOrThrow(UUID id) {
        return categoryRepository.findByIdAndTenantIdAndUserId(id, TenantContext.get(), currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getIcon(), category.getType());
    }
}