package com.spendly.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * idToken is the credential Google Identity Services hands back to the
 * frontend after a successful sign-in - the backend verifies it server-side
 * against Google's public keys before trusting anything in it.
 */
public record GoogleAuthRequest(
        @NotBlank String idToken
) {
}