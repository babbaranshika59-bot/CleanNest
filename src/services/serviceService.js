import { request } from "./apiClient.js";

// REST wrapper for /categories. list() resolves to { items, total, page, pageSize, totalPages }.
export const serviceService = {
  list: (params) => request("GET", "/categories", { params }),
  get: (id) => request("GET", `/categories/${id}`),
  create: (data) => request("POST", "/categories", { body: data }),
  update: (id, data) => request("PUT", `/categories/${id}`, { body: data }),
  remove: (id) => request("DELETE", `/categories/${id}`),
};
