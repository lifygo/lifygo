import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ListLogsParams, ListLogsResponse } from "./logs.types";

export function listLogs(apiKey: string, params: ListLogsParams = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.status) query.set("status", params.status);

  const queryString = query.toString();
  const path = queryString
    ? `${ENDPOINTS.EMAIL.LOGS}?${queryString}`
    : ENDPOINTS.EMAIL.LOGS;

  return apiFetch<ListLogsResponse>(path, apiKey);
}