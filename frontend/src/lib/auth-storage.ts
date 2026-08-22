const TOKEN_KEY = "spendly_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // guards against server-side rendering
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}