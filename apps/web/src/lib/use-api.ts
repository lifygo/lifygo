"use client";

import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "./api";

// Hook that returns a fetch function pre-wired with the current
// Clerk session token. No manual token storage — Clerk handles
// refresh and persistence internally.
export function useApi() {
  const { getToken } = useAuth();

  async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");

    return apiFetch<T>(path, "", {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  return { call };
}