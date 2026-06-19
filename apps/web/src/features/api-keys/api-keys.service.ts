import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ApiKey, ApiKeyResponse, CreateApiKeyInput } from "./api-keys.types";

export function createApiKey(apiKey: string, input: CreateApiKeyInput) {
  return apiFetch<ApiKeyResponse>(ENDPOINTS.API_KEYS.CREATE, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listApiKeys(apiKey: string) {
  return apiFetch<ApiKey[]>(ENDPOINTS.API_KEYS.LIST, apiKey);
}

export function deleteApiKey(apiKey: string, id: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.API_KEYS.DELETE(id), apiKey, {
    method: "DELETE",
  });
}