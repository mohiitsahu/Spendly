package com.spendly.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.spendly.backend.dto.auth.AuthResponse;
import com.spendly.backend.entity.AppUser;
import com.spendly.backend.repository.AppUserRepository;
import com.spendly.backend.security.GoogleTokenVerifier;
import com.spendly.backend.security.JwtService;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, GoogleTokenVerifier googleTokenVerifier) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public AuthResponse register(String email, String rawPassword, String displayName) {
        if (userRepository.existsByTenantIdAndEmail(TenantContext.get(), email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDisplayName(displayName);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return toAuthResponse(user, true);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String email, String rawPassword) {
        AppUser user = userRepository.findByTenantIdAndEmail(TenantContext.get(), email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getPasswordHash() == null) {
            throw new IllegalArgumentException("This account signs in with Google - use the Google sign-in button");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return toAuthResponse(user, false);
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idTokenString) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        AppUser user = userRepository.findByTenantIdAndGoogleId(TenantContext.get(), googleId)
                .or(() -> userRepository.findByTenantIdAndEmail(TenantContext.get(), email))
                .orElse(null);

        boolean isNewUser = user == null;

        if (isNewUser) {
            user = new AppUser();
            user.setEmail(email);
            user.setDisplayName(name);
            user.setUpdatedAt(Instant.now());
        }
        // Link the Google identity even if the user originally signed up with
        // email/password - lets them use either method going forward.
        user.setGoogleId(googleId);
        userRepository.save(user);

        return toAuthResponse(user, isNewUser);
    }

    private AuthResponse toAuthResponse(AppUser user, boolean isNewUser) {
        String accessToken = jwtService.issueAccessToken(user.getId(), user.getTenantId(), user.getEmail());
        return new AuthResponse(accessToken, user.getId().toString(), user.getEmail(), isNewUser);
    }
}