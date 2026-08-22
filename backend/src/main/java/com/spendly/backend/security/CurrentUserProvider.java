package com.spendly.backend.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Reads the current authenticated user's id, set by JwtAuthFilter as the
 * authentication's principal (the JWT's "sub" claim).
 */
@Service
public class CurrentUserProvider {

    public UUID getCurrentUserId() {
        String userIdString = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userIdString);
    }
}