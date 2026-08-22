import { CategoryResponse } from "./category";

export interface TransactionResponse {
  id: string;
  category: CategoryResponse;
  amount: number;
  currency: string;
  note: string | null;
  occurredAt: string; // ISO 8601 string
}

export interface TransactionRequest {
  categoryId: string;
  amount: number;
  note?: string;
  occurredAt: string;
}