package com.spendly.backend.service;

import java.util.UUID;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.spendly.backend.dto.auth.AuthResponse;
import com.spendly.backend.entity.AppUser;
import com.spendly.backend.entity.EmailOtpChallenge;
import com.spendly.backend.repository.AppUserRepository;
import com.spendly.backend.repository.EmailOtpChallengeRepository;
import com.spendly.backend.security.EmailSender;
import com.spendly.backend.security.GoogleTokenVerifier;
import com.spendly.backend.security.JwtService;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_MINUTES = 5;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    private final AppUserRepository userRepository;
    private final EmailOtpChallengeRepository otpRepository;
    private final EmailSender emailSender;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final BCryptPasswordEncoder otpEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    public AuthService(AppUserRepository userRepository, EmailOtpChallengeRepository otpRepository,
                        EmailSender emailSender, JwtService jwtService, GoogleTokenVerifier googleTokenVerifier) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailSender = emailSender;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public void requestEmailOtp(String email) {
        String otp = generateOtp();

        EmailOtpChallenge challenge = new EmailOtpChallenge();
        challenge.setEmail(email);
        challenge.setOtpHash(otpEncoder.encode(otp));
        challenge.setExpiresAt(Instant.now().plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES));
        otpRepository.save(challenge);

        emailSender.sendOtp(email, otp);
    }

    @Transactional
    public AuthResponse verifyEmailOtp(String email, String submittedOtp) {
        EmailOtpChallenge challenge = otpRepository
                .findFirstByTenantIdAndEmailAndConsumedFalseOrderByCreatedAtDesc(TenantContext.get(), email)
                .orElseThrow(() -> new IllegalArgumentException("No code was requested for this email"));

        if (challenge.isConsumed()) {
            throw new IllegalArgumentException("This code has already been used");
        }
        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Code has expired, request a new one");
        }
        if (challenge.getAttemptCount() >= MAX_VERIFY_ATTEMPTS) {
            throw new IllegalArgumentException("Too many attempts, request a new code");
        }

        challenge.setAttemptCount(challenge.getAttemptCount() + 1);

        if (!otpEncoder.matches(submittedOtp, challenge.getOtpHash())) {
            throw new IllegalArgumentException("Incorrect code");
        }

        challenge.setConsumed(true);

        AppUser user = findOrCreateByEmail(email, null);

        return toAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idTokenString) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        AppUser user = findOrCreateByEmail(email, name);

        // Link the Google identity even if the account already existed from
        // email OTP - same email always means the same account either way.
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
        }

        return toAuthResponse(user);
    }

    /**
     * The core of unifying auth: every login path (email OTP or Google)
     * resolves to the same AppUser row purely by email. A user who signs in
     * with Google today and email OTP tomorrow (or vice versa) always lands
     * in the same account - there's no way to end up with two accounts for
     * one email.
     */
    private AppUser findOrCreateByEmail(String email, String displayName) {
        UUID tenantId = TenantContext.get();
        return userRepository.findByTenantIdAndEmail(tenantId, email)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setEmail(email);
                    newUser.setDisplayName(displayName);
                    newUser.setUpdatedAt(Instant.now());
                    return userRepository.save(newUser);
                });
    }

    private AuthResponse toAuthResponse(AppUser user) {
        String accessToken = jwtService.issueAccessToken(user.getId(), user.getTenantId(), user.getEmail());
        return new AuthResponse(accessToken, user.getId().toString(), user.getEmail(), false);
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int value = random.nextInt(bound);
        return String.format("%0" + OTP_LENGTH + "d", value);
    }
}