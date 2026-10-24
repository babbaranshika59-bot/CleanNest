import { request } from "./apiClient.js";

// REST wrapper for /bookings. list() resolves to { items, total, page, pageSize, totalPages }.
export const bookingService = {
  list: (params) => request("GET", "/bookings", { params }),
  get: (id) => request("GET", `/bookings/${id}`),
  create: (data) => request("POST", "/bookings", { body: data }),
  update: (id, data) => request("PUT", `/bookings/${id}`, { body: data }),
  updateStatus: (id, status) => request("PATCH", `/bookings/${id}/status`, { body: { status } }),
  remove: (id) => request("DELETE", `/bookings/${id}`),
};
