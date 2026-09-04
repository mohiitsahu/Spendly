package com.spendly.backend.repository;

import com.spendly.backend.entity.EmailOtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpChallengeRepository extends JpaRepository<EmailOtpChallenge, UUID> {

    Optional<EmailOtpChallenge> findFirstByTenantIdAndEmailAndConsumedFalseOrderByCreatedAtDesc(
            UUID tenantId, String email);
}