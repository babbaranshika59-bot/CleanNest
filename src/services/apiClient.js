// Single entry point for every network call in the app.
//
//  • If VITE_API_BASE_URL is set (e.g. http://localhost:4000/api) → real native fetch().
//  • Otherwise → the in-browser mock REST server (mockServer.js).
//
// Either way the services call request(method, path, { body, params }) and receive parsed JSON,
// or an ApiError. GET requests are retried once on network/5xx failures.
import { ApiError } from "./apiError.js";
import { mockRequest } from "./mockServer.js";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const USING_MOCK_API = !API_BASE;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(method, path, { body, params }) {
  const url = new URL(API_BASE + path, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status}).`, res.status);
  return data;
}

export async function request(method, path, { body, params, retries } = {}) {
  const maxRetries = retries ?? (method === "GET" ? 1 : 0);
  let attempt = 0;
  for (;;) {
    try {
      return USING_MOCK_API
        ? await mockRequest(method, path, { body, params })
        : await fetchJson(method, path, { body, params });
    } catch (err) {
      const retryable = !err.status || err.status >= 500;
      if (attempt >= maxRetries || !retryable) throw err;
      attempt += 1;
      await wait(400 * attempt);
    }
  }
}
