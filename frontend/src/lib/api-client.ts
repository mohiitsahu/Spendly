import { getToken } from "./auth-storage";
import { ApiError } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiClientError extends Error {
  status: number;
  fieldErrors: ApiError["fieldErrors"];

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.status = apiError.status;
    this.fieldErrors = apiError.fieldErrors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody: ApiError = await response.json();
    throw new ApiClientError(errorBody);
  }

  // Some endpoints (like otp/request) return 200/204 with no body at all -
  // only attempt to parse JSON if there's actually content to parse.
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text);
}