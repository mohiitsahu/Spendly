import { apiRequest } from "./api-client";
import { TransactionRequest, TransactionResponse } from "@/types/transaction";
import { PageResponse } from "@/types/api";

export function listTransactions(page: number = 0, size: number = 20): Promise<PageResponse<TransactionResponse>> {
  return apiRequest<PageResponse<TransactionResponse>>(`/api/transactions?page=${page}&size=${size}`);
}

export function createTransaction(request: TransactionRequest): Promise<TransactionResponse> {
  return apiRequest<TransactionResponse>("/api/transactions", {
    method: "POST",
    body: request,
  });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiRequest<void>(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}