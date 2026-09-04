import { apiRequest } from "./api-client";
import { AuthResponse, EmailOtpRequest, EmailOtpVerifyRequest, GoogleAuthRequest } from "@/types/auth";

export function requestEmailOtp(request: EmailOtpRequest): Promise<void> {
  return apiRequest<void>("/api/auth/otp/request", {
    method: "POST",
    body: request,
    auth: false,
  });
}

export function verifyEmailOtp(request: EmailOtpVerifyRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/otp/verify", {
    method: "POST",
    body: request,
    auth: false,
  });
}

export function loginWithGoogle(request: GoogleAuthRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: request,
    auth: false,
  });
}