import { auth } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiFetch = async (path: string, options: RequestInit = {}): Promise<any> => {
  const headers = new Headers(options.headers || {});
  
  // Attach Firebase ID token if the user is logged in
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    } catch (err) {
      console.warn("Failed to get Firebase token:", err);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 2xx → success
  if (res.ok) {
    // some endpoints like DELETE return empty 204 or just json, check content-length if needed
    // but the current implementation expects json
    return res.json().catch(() => ({}));
  }

  // 404 → "not found" is a valid response (e.g., new user with no profile)
  if (res.status === 404) return null;

  // All other errors → throw with the server's error message if available
  const body = await res.json().catch(() => ({}));
  throw new Error(body?.error || body?.message || `API error ${res.status}`);
};

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) =>
    apiFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: (path: string, body: unknown) =>
    apiFetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  delete: (path: string) =>
    apiFetch(path, { method: "DELETE" }),
};
