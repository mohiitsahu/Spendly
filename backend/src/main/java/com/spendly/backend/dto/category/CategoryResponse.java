package com.spendly.backend.dto.category;

import com.spendly.backend.entity.CategoryType;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String icon,
        CategoryType type
) {
}