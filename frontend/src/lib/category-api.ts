import { apiRequest } from "./api-client";
import { CategoryRequest, CategoryResponse } from "@/types/category";

export function listCategories(): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>("/api/categories");
}

export function createCategory(request: CategoryRequest): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>("/api/categories", {
    method: "POST",
    body: request,
  });
}

export function deleteCategory(id: string): Promise<void> {
  return apiRequest<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}