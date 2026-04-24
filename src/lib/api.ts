const PRIMARY_URL = "https://college-api-xtwb.onrender.com";
const SECONDARY_URL = "https://campushub-a9dsa7bxcdgaeygv.centralindia-01.azurewebsites.net";

let currentBase = PRIMARY_URL;

const fetchWithFailover = async (path: string, options?: RequestInit): Promise<any> => {
  try {
    const res = await fetch(`${currentBase}${path}`, options);
    if (res.ok) return res.json();
    
    // If we get a 404, it might just mean the record doesn't exist (e.g. new profile)
    // We should only failover on 5xx or network errors, but since Render can be slow/down,
    // we try secondary if NOT 2xx.
    throw new Error(`API returned ${res.status}`);
  } catch (err) {
    if (currentBase === PRIMARY_URL) {
      console.warn(`Primary API failed for ${path}, trying secondary...`, err);
      try {
        const res2 = await fetch(`${SECONDARY_URL}${path}`, options);
        // If secondary works, we could optionally update currentBase for this session
        // but let's keep it safe for now.
        return res2.json();
      } catch (err2) {
        console.error("Secondary API also failed", err2);
        throw err2;
      }
    }
    throw err;
  }
};

export const api = {
  get: (path: string) => fetchWithFailover(path),
  post: (path: string, body: unknown) => 
    fetchWithFailover(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: (path: string, body: unknown) => 
    fetchWithFailover(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  delete: (path: string) => 
    fetchWithFailover(path, { method: "DELETE" }),
};
