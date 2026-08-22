export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string | null;
  type: CategoryType;
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  type: CategoryType;
}