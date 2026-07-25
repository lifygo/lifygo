"use client";

import { useLifygoAuth } from "@/components/auth-provider";
import { apiFetch } from "./api";

export function useApi() {
  // Use the configured auth provider (local or Clerk) instead of coupling
  // API calls to Clerk. This is important for local development, where the
  // app is wrapped in LocalAuthProvider rather than ClerkProvider.
  const { getToken } = useLifygoAuth();

  async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return apiFetch<T>(path, "", {
      ...options,
      headers,
      credentials: "include",
    });
  }

  return { call };
}
