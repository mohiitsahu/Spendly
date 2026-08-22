package com.spendly.backend.service;

import com.spendly.backend.dto.category.CategoryRequest;
import com.spendly.backend.dto.category.CategoryResponse;
import com.spendly.backend.entity.Category;
import com.spendly.backend.exception.ResourceNotFoundException;
import com.spendly.backend.repository.CategoryRepository;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setIcon(request.icon());
        category.setType(request.type());
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAllByTenantId(TenantContext.get()).stream()
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
        categoryRepository.delete(category);
    }

    private Category findOrThrow(UUID id) {
        return categoryRepository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getIcon(), category.getType());
    }
}