const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    credentials: options.credentials || "omit",
  });

  const data = await res.json();

  if (!res.ok) {
    if (
      res.status === 401 &&
      (data.error === "invalid session" || data.error === "missing credentials")
    ) {
      window.location.assign("/sign-in");
    }
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}
