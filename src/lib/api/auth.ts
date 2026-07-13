// Persistence of the operator's auth token (browser localStorage).
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
