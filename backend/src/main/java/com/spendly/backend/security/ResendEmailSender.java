package com.spendly.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Sends OTP emails via Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * A plain HTTPS POST, no SDK needed - keeps the dependency footprint small.
 */
@Component
public class ResendEmailSender implements EmailSender {

    private final RestClient restClient;
    private final String fromAddress;

    public ResendEmailSender(
            @Value("${spendly.resend.api-key}") String apiKey,
            @Value("${spendly.resend.from-address}") String fromAddress) {
        this.fromAddress = fromAddress;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public void sendOtp(String toEmail, String otp) {
        String html = """
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                  <h2 style="color: #16241c;">Your Spendly login code</h2>
                  <p style="font-size: 28px; letter-spacing: 4px; font-weight: 600; color: #1f6f4a;">%s</p>
                  <p style="color: #666; font-size: 14px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
                </div>
                """.formatted(otp);

        restClient.post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", "Spendly <" + fromAddress + ">",
                        "to", toEmail,
                        "subject", "Your Spendly login code: " + otp,
                        "html", html
                ))
                .retrieve()
                .toBodilessEntity();
    }
}