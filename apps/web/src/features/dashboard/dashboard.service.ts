import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { DashboardStats } from "./dashboard.types";

export function getDashboardStats(apiKey: string) {
  return apiFetch<DashboardStats>(ENDPOINTS.DASHBOARD.STATS, apiKey);
}