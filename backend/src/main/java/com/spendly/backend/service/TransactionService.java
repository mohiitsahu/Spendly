package com.spendly.backend.service;

import com.spendly.backend.dto.PageResponse;
import com.spendly.backend.dto.category.CategoryResponse;
import com.spendly.backend.dto.transaction.TransactionRequest;
import com.spendly.backend.dto.transaction.TransactionResponse;
import com.spendly.backend.entity.AppUser;
import com.spendly.backend.entity.Category;
import com.spendly.backend.entity.Transaction;
import com.spendly.backend.exception.ResourceNotFoundException;
import com.spendly.backend.repository.AppUserRepository;
import com.spendly.backend.repository.CategoryRepository;
import com.spendly.backend.repository.TransactionRepository;
import com.spendly.backend.security.CurrentUserProvider;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AppUserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public TransactionService(TransactionRepository transactionRepository, CategoryRepository categoryRepository,
                               AppUserRepository userRepository, CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        UUID tenantId = TenantContext.get();
        UUID userId = currentUserProvider.getCurrentUserId();

        Category category = categoryRepository.findByIdAndTenantIdAndUserId(request.categoryId(), tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAmount(request.amount());
        transaction.setNote(request.note());
        transaction.setOccurredAt(request.occurredAt());
        transactionRepository.save(transaction);

        return toResponse(transaction);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> list(Pageable pageable) {
        Page<Transaction> page = transactionRepository.findAllByTenantIdAndUserIdOrderByOccurredAtDesc(
                TenantContext.get(), currentUserProvider.getCurrentUserId(), pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Transactional
    public TransactionResponse update(UUID id, TransactionRequest request) {
        Transaction transaction = findOrThrow(id);
        UUID userId = currentUserProvider.getCurrentUserId();

        Category category = categoryRepository.findByIdAndTenantIdAndUserId(request.categoryId(), TenantContext.get(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        transaction.setCategory(category);
        transaction.setAmount(request.amount());
        transaction.setNote(request.note());
        transaction.setOccurredAt(request.occurredAt());

        return toResponse(transaction);
    }

    @Transactional
    public void delete(UUID id) {
        Transaction transaction = findOrThrow(id);
        transactionRepository.delete(transaction);
    }

    private Transaction findOrThrow(UUID id) {
        return transactionRepository.findByIdAndTenantIdAndUserId(id, TenantContext.get(), currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private TransactionResponse toResponse(Transaction t) {
        CategoryResponse categoryResponse = new CategoryResponse(
                t.getCategory().getId(), t.getCategory().getName(), t.getCategory().getIcon(), t.getCategory().getType());
        return new TransactionResponse(t.getId(), categoryResponse, t.getAmount(), t.getCurrency(), t.getNote(), t.getOccurredAt());
    }
}