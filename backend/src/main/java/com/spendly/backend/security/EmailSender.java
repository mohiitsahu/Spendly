package com.spendly.backend.security;

public interface EmailSender {
    void sendOtp(String toEmail, String otp);
}