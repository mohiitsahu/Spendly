package com.spendly.backend.dto.goal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String name,
        BigDecimal targetAmount,
        BigDecimal savedAmount,
        LocalDate deadline
) {
}