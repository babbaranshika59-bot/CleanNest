// Booking lifecycle + role permissions (frontend demo only).
// NOTE: client-side checks are NOT real security. A real backend must enforce the same rules.
import { ROLES, BOOKING_STATUS as S } from "./constants.js";

// Legal state machine (role-agnostic). The mock server also enforces this.
export const LIFECYCLE = {
  [S.PENDING]: [S.CONFIRMED, S.REJECTED, S.CANCELLED],
  [S.CONFIRMED]: [S.COMPLETED, S.CANCELLED],
  [S.COMPLETED]: [],
  [S.CANCELLED]: [],
  [S.REJECTED]: [],
};

// Which next-statuses may this user trigger on this booking?
export function allowedTransitions(booking, user) {
  if (!booking || !user) return [];
  const legal = LIFECYCLE[booking.status] || [];
  if (user.role === ROLES.ADMIN) return legal;
  if (user.role === ROLES.PROVIDER && user.providerId === booking.providerId) {
    return legal.filter((s) => s !== S.CANCELLED || booking.status === S.CONFIRMED);
  }
  if (user.role === ROLES.CUSTOMER && user.id === booking.customerId) {
    return legal.filter((s) => s === S.CANCELLED);
  }
  return [];
}

export const canDeleteBooking = (user) => user?.role === ROLES.ADMIN;
export const canEditBooking = (user) => user?.role === ROLES.ADMIN;

export function canViewBooking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.PROVIDER) return user.providerId === booking.providerId;
  return user.id === booking.customerId;
}

export function countByStatus(bookings) {
  const c = { total: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0 };
  bookings.forEach((b) => {
    if (c[b.status] !== undefined) c[b.status] += 1;
  });
  return c;
}
