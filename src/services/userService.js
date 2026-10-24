import { request } from "./apiClient.js";

// REST wrapper for /users. list() resolves to { items, total, page, pageSize, totalPages }.
export const userService = {
  list: (params) => request("GET", "/users", { params }),
  get: (id) => request("GET", `/users/${id}`),
  create: (data) => request("POST", "/users", { body: data }),
  update: (id, data) => request("PUT", `/users/${id}`, { body: data }),
  remove: (id) => request("DELETE", `/users/${id}`),
};
