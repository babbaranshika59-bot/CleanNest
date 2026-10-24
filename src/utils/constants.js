// Shared constants for roles, booking lifecycle and storage keys.

export const ROLES = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  customer: "Customer",
  provider: "Service Provider",
  admin: "Admin",
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

// Statuses that still "hold" a time slot.
export const ACTIVE_STATUSES = ["pending", "confirmed"];

export const PAYMENT_METHODS = ["Cash after service", "UPI", "Card"];

export const TIME_SLOTS = [
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
];

export const AVAILABILITY_OPTIONS = [
  "Available Today",
  "Available Tomorrow",
  "Unavailable",
];

export const STORAGE_KEYS = {
  session: "cleannest.session",
  legacyUser: "cleannest.user", // Stage-1 key that stored a plaintext password. Removed on load.
  favorites: "cleannest.favorites",
  notifications: "cleannest.notifications",
  dbPrefix: "cleannest.db.",
  simulateFailure: "cleannest.simulateFailure",
};

export function dashboardPathFor(role) {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.PROVIDER) return "/provider";
  return "/customer";
}
