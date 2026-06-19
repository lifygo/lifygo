import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SmtpConfig, UpsertSmtpConfigInput } from "./smtp.types";

export function upsertSmtpConfig(apiKey: string, input: UpsertSmtpConfigInput) {
  return apiFetch<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getSmtpConfig(apiKey: string) {
  return apiFetch<SmtpConfig>(ENDPOINTS.SMTP.GET, apiKey);
}

export function deleteSmtpConfig(apiKey: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.SMTP.DELETE, apiKey, {
    method: "DELETE",
  });
}