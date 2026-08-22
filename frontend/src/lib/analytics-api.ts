import { apiRequest } from "./api-client";
import { DashboardSummary } from "@/types/analytics";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/api/analytics/dashboard");
}