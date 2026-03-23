const BASE_URL = "https://college-api-production-3975.up.railway.app";

export const api = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`).then((res) => res.json()),

  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  put: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, { method: "DELETE" }).then((res) => res.json()),
};