import { apiRequest } from "./api-client";
import { AuthResponse, LoginRequest, RegisterRequest, GoogleAuthRequest } from "@/types/auth";

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: request,
    auth: false,
  });
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
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