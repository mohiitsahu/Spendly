package com.spendly.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmailOtpVerifyRequest(
        @NotBlank
        @Email(message = "Enter a valid email address")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                message = "Enter a valid email address"
        )
        String email,

        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "Code must be 6 digits")
        String otp
) {
}