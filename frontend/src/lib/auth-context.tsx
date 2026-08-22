"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, setToken, clearToken } from "./auth-storage";
import * as authApi from "./auth-api";
import { LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        setUser({ userId: payload.sub, email: payload.email });
      }
    }
    setIsLoading(false);
  }, []);

  async function handleLogin(request: LoginRequest) {
    const response = await authApi.login(request);
    setToken(response.accessToken);
    setUser({ userId: response.userId, email: response.email });
  }

  async function handleRegister(request: RegisterRequest) {
    const response = await authApi.register(request);
    setToken(response.accessToken);
    setUser({ userId: response.userId, email: response.email });
  }

  async function handleLoginWithGoogle(idToken: string) {
    const response = await authApi.loginWithGoogle({ idToken });
    setToken(response.accessToken);
    setUser({ userId: response.userId, email: response.email });
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        loginWithGoogle: handleLoginWithGoogle,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function decodeJwtPayload(token: string): { sub: string; email: string } | null {
  try {
    const payloadBase64 = token.split(".")[1];
    return JSON.parse(atob(payloadBase64));
  } catch {
    return null;
  }
}