const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Generic fetch wrapper for the LifyGo API.
// Adds the API key header and parses JSON automatically.
export async function apiFetch<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}