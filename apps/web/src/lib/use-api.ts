"use client";

import { apiFetch } from "./api";

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

export function useApi() {
  async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    return apiFetch<T>(path, "", {
      ...options,
      headers,
      credentials: "include",
    });
  }

  return { call };
}