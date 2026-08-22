package com.spendly.backend.dto.goal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @NotBlank String name,
        @NotNull @DecimalMin(value = "0.01", message = "Target amount must be greater than 0") BigDecimal targetAmount,
        LocalDate deadline
) {
}