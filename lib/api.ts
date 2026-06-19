// Talks to the same NoLoop backend as the main app.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "noloop_admin_token";

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}
export function setToken(t: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? `Request failed (${res.status})`);
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export async function authedGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken() ?? ""}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
