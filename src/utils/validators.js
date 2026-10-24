// Field validators. Each validateX(values) returns an errors object ({} means valid).
import { todayISO } from "./format.js";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const isEmail = (v) => EMAIL_RE.test(String(v || "").trim());
export const isPhone = (v) => /^\d{10}$/.test(String(v || "").replace(/\D/g, ""));

export function validateBooking(f) {
  const e = {};
  if (!f.name?.trim()) e.name = "Please enter your name.";
  if (!isPhone(f.phone)) e.phone = "Enter a valid 10-digit phone number.";
  if (!f.service) e.service = "Select a service.";
  if (!f.date) e.date = "Choose a preferred date.";
  else if (f.date < todayISO()) e.date = "Date cannot be in the past.";
  if (!f.time) e.time = "Choose a preferred time.";
  if (!f.address?.trim()) e.address = "Enter your address.";
  else if (f.address.trim().length < 8) e.address = "Please enter a fuller address (min 8 characters).";
  if (!f.paymentMethod) e.paymentMethod = "Select a payment method.";
  if (f.notes && f.notes.length > 300) e.notes = "Notes must be 300 characters or fewer.";
  return e;
}

export function validateProfile(f) {
  const e = {};
  if (!f.name?.trim()) e.name = "Name is required.";
  else if (f.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
  if (!f.email?.trim()) e.email = "Email is required.";
  else if (!isEmail(f.email)) e.email = "Enter a valid email.";
  if (f.phone && !isPhone(f.phone)) e.phone = "Enter a valid 10-digit phone number.";
  if (f.address && f.address.trim().length > 0 && f.address.trim().length < 8)
    e.address = "Please enter a fuller address (min 8 characters).";
  return e;
}

export function validateProviderBusiness(f) {
  const e = {};
  if (!f.name?.trim()) e.name = "Business name is required.";
  if (!f.category) e.category = "Select a category.";
  if (!f.location?.trim()) e.location = "Location is required.";
  if (f.price === "" || f.price === undefined || Number(f.price) <= 0)
    e.price = "Enter a starting price greater than 0.";
  if (!f.experience?.trim()) e.experience = "Enter your experience (e.g. 5 years).";
  if (!f.description?.trim()) e.description = "Add a short description.";
  else if (f.description.trim().length < 20) e.description = "Description should be at least 20 characters.";
  if (f.phone && !isPhone(f.phone)) e.phone = "Enter a valid 10-digit phone number.";
  return e;
}

export function validateServiceName(name, existing = []) {
  const v = String(name || "").trim();
  if (!v) return "Enter a service name.";
  if (v.length < 3) return "Service name must be at least 3 characters.";
  if (v.length > 60) return "Service name must be 60 characters or fewer.";
  if (existing.some((s) => s.toLowerCase() === v.toLowerCase())) return "This service is already listed.";
  return "";
}

export function validateUserForm(f, { isNew }) {
  const e = validateProfile(f);
  if (!f.role) e.role = "Select a role.";
  if (!f.status) e.status = "Select a status.";
  if (isNew) {
    if (!f.password) e.password = "Password is required.";
    else if (f.password.length < 6) e.password = "Use at least 6 characters.";
  } else if (f.password && f.password.length < 6) {
    e.password = "Use at least 6 characters (or leave blank to keep the current one).";
  }
  return e;
}

export function validateCategoryForm(f) {
  const e = {};
  if (!f.name?.trim()) e.name = "Category name is required.";
  else if (f.name.trim().length < 3) e.name = "Name must be at least 3 characters.";
  if (!f.icon?.trim()) e.icon = "Add an emoji icon.";
  if (!f.description?.trim()) e.description = "Add a short description.";
  return e;
}

export function validateBookingEdit(f) {
  const e = {};
  if (!f.date) e.date = "Choose a date.";
  if (!f.time) e.time = "Choose a time.";
  if (!f.address?.trim()) e.address = "Address is required.";
  if (!isPhone(f.phone)) e.phone = "Enter a valid 10-digit phone number.";
  if (f.price === "" || Number(f.price) <= 0) e.price = "Enter a price greater than 0.";
  return e;
}
