package com.spendly.backend.dto.auth;

public record AuthResponse(
        String accessToken,
        String userId,
        String email,
        boolean newUser
) {
}