package com.spendly.backend.dto.category;

import com.spendly.backend.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @NotBlank String name,
        String icon,
        @NotNull CategoryType type
) {
}