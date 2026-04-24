const BASE_URL = "https://college-api-xtwb.onrender.com";

const apiFetch = async (path: string, options?: RequestInit): Promise<any> => {
  const res = await fetch(`${BASE_URL}${path}`, options);

  // 2xx → success
  if (res.ok) return res.json();

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
