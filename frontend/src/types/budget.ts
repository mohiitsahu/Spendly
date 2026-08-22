import { CategoryResponse } from "./category";

export interface BudgetResponse {
  id: string;
  category: CategoryResponse;
  period: string;
  limitAmount: number;
}

export interface BudgetRequest {
  categoryId: string;
  limitAmount: number;
}