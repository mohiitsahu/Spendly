import { apiRequest } from "./api-client";
import { BudgetRequest, BudgetResponse } from "@/types/budget";

export function listBudgets(): Promise<BudgetResponse[]> {
  return apiRequest<BudgetResponse[]>("/api/budgets");
}

export function createBudget(request: BudgetRequest): Promise<BudgetResponse> {
  return apiRequest<BudgetResponse>("/api/budgets", {
    method: "POST",
    body: request,
  });
}

export function deleteBudget(id: string): Promise<void> {
  return apiRequest<void>(`/api/budgets/${id}`, {
    method: "DELETE",
  });
}