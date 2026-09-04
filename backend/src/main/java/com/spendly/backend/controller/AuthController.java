package com.spendly.backend.controller;

import com.spendly.backend.dto.auth.AuthResponse;
import com.spendly.backend.dto.auth.EmailOtpRequest;
import com.spendly.backend.dto.auth.EmailOtpVerifyRequest;
import com.spendly.backend.dto.auth.GoogleAuthRequest;
import com.spendly.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/otp/request")
    public ResponseEntity<Void> requestOtp(@Valid @RequestBody EmailOtpRequest request) {
        authService.requestEmailOtp(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody EmailOtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyEmailOtp(request.email(), request.otp()));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.idToken()));
    }
}