const PRIMARY_URL = "https://college-api.azurewebsites.net";
const SECONDARY_URL = "https://college-api.onrender.com";

// In a real multi-cloud setup, you might want to dynamically check which one is up
// or use a load balancer. For now, we'll default to Azure (no sleep) as primary.
let BASE_URL = PRIMARY_URL;

export const api = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`).then((res) => {
      if (!res.ok && BASE_URL === PRIMARY_URL) {
        // Simple failover attempt if primary fails
        console.warn("Primary API failed, trying secondary...");
        return fetch(`${SECONDARY_URL}${path}`).then(r => r.json());
      }
      return res.json();
    }),

  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok && BASE_URL === PRIMARY_URL) {
        return fetch(`${SECONDARY_URL}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return res.json();
    }),

  put: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok && BASE_URL === PRIMARY_URL) {
        return fetch(`${SECONDARY_URL}${path}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return res.json();
    }),

  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, { method: "DELETE" }).then((res) => {
      if (!res.ok && BASE_URL === PRIMARY_URL) {
        return fetch(`${SECONDARY_URL}${path}`, { method: "DELETE" }).then(r => r.json());
      }
      return res.json();
    }),
};