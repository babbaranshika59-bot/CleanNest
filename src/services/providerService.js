import { request } from "./apiClient.js";

// REST wrapper for /providers. list() resolves to { items, total, page, pageSize, totalPages }.
export const providerService = {
  list: (params) => request("GET", "/providers", { params }),
  get: (id) => request("GET", `/providers/${id}`),
  create: (data) => request("POST", "/providers", { body: data }),
  update: (id, data) => request("PUT", `/providers/${id}`, { body: data }),
  remove: (id) => request("DELETE", `/providers/${id}`),
};
