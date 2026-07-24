"use client";

import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "./api";

export function useApi() {
  const { getToken } = useAuth();

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