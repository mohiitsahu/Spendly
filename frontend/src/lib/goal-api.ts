import { apiRequest } from "./api-client";
import { GoalRequest, GoalResponse } from "@/types/goal";

export function listGoals(): Promise<GoalResponse[]> {
  return apiRequest<GoalResponse[]>("/api/goals");
}

export function createGoal(request: GoalRequest): Promise<GoalResponse> {
  return apiRequest<GoalResponse>("/api/goals", {
    method: "POST",
    body: request,
  });
}

export function deleteGoal(id: string): Promise<void> {
  return apiRequest<void>(`/api/goals/${id}`, {
    method: "DELETE",
  });
}