// ─────────────────────────────────────────────────────────────────────────────
// MOCK REST SERVER (browser-only)
//
// CleanNest has no backend. This module behaves like a tiny REST API whose "database"
// is localStorage ("cleannest.db.<collection>"). The service files talk to it through
// apiClient.request(), which uses the SAME interface as a real fetch() call, so
// swapping in a real server later only needs VITE_API_BASE_URL to be set.
//
// Limitations (documented honestly): no auth tokens, no real security. Role rules are
// enforced in the UI only. Data lives in this browser only.
// ─────────────────────────────────────────────────────────────────────────────
import { ApiError } from "./apiError.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { LIFECYCLE } from "../utils/bookingRules.js";
import { demoHash } from "../utils/hash.js";
import { seedUsers, seedProviders, seedCategories, seedBookings } from "./seedData.js";

const LATENCY_MS = 250;
const SEEDERS = { users: seedUsers, providers: seedProviders, categories: seedCategories, bookings: seedBookings };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowISO = () => new Date().toISOString();

// ── storage ─────────────────────────────────────────────────────────────────
function writeCollection(name, items) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.dbPrefix + name, JSON.stringify(items));
  } catch {
    throw new ApiError("Browser storage is full or unavailable.", 507);
  }
}

function readCollection(name) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.dbPrefix + name);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Drop malformed rows instead of crashing on stale/edited data.
        return parsed.filter((r) => r && typeof r === "object" && r.id !== undefined);
      }
    }
  } catch {
    /* corrupt JSON → reseed below */
  }
  const seeded = SEEDERS[name]();
  writeCollection(name, seeded);
  return seeded;
}

const safeUser = ({ passwordHash, ...rest }) => { void passwordHash; return rest; };
const lc = (v) => String(v ?? "").toLowerCase();

function paginate(items, params) {
  const pageSize = Number(params.pageSize) || items.length || 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages,
  };
}

const nextNumericId = (items) => items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0) + 1;
const nextBookingId = (items) =>
  `BK-${items.reduce((m, i) => Math.max(m, Number(String(i.id).replace(/\D/g, "")) || 1000), 1000) + 1}`;
const slug = (s) => lc(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function need(cond, message, status = 422) {
  if (!cond) throw new ApiError(message, status);
}

// ── route table ─────────────────────────────────────────────────────────────
const routes = {
  // AUTH ----------------------------------------------------------------------
  "POST /auth/login": ({ body }) => {
    const users = readCollection("users");
    const u = users.find((x) => lc(x.email) === lc(body.email));
    if (!u || u.passwordHash !== demoHash(body.password || "")) throw new ApiError("Invalid email or password.", 401);
    if (u.status === "blocked") throw new ApiError("This account has been blocked. Please contact support.", 403);
    return safeUser(u);
  },
  "POST /auth/signup": ({ body }) => {
    const users = readCollection("users");
    need(body.name && body.email && body.password, "Name, email and password are required.");
    if (users.some((x) => lc(x.email) === lc(body.email))) throw new ApiError("An account with this email already exists.", 409);
    const role = body.role === "provider" ? "provider" : "customer"; // admin can never self-register
    const user = {
      id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone || "",
      address: "",
      role,
      status: "active",
      passwordHash: demoHash(body.password),
      createdAt: nowISO(),
    };
    if (role === "provider") {
      const providers = readCollection("providers");
      const provider = {
        id: nextNumericId(providers),
        name: body.businessName?.trim() || `${user.name} Services`,
        category: body.category,
        location: body.location?.trim() || "",
        rating: 0,
        reviews: 0,
        experience: "New",
        price: 299,
        availability: "Available Tomorrow",
        description: "New provider on CleanNest. Update your profile to tell customers more about your services.",
        services: [],
        phone: body.phone || "",
        status: "active",
        ownerUserId: user.id,
      };
      writeCollection("providers", [...providers, provider]);
      user.providerId = provider.id;
    }
    writeCollection("users", [...users, user]);
    return safeUser(user);
  },

  // USERS ---------------------------------------------------------------------
  "GET /users": ({ params }) => {
    let items = readCollection("users");
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.status) items = items.filter((u) => u.status === params.status);
    if (params.q) {
      const q = lc(params.q).trim();
      items = items.filter((u) => lc(u.name).includes(q) || lc(u.email).includes(q));
    }
    return paginate(items.map(safeUser), params);
  },
  "GET /users/:id": ({ id }) => {
    const u = readCollection("users").find((x) => x.id === id);
    if (!u) throw new ApiError("User not found.", 404);
    return safeUser(u);
  },
  "POST /users": ({ body }) => {
    const users = readCollection("users");
    need(body.name?.trim() && body.email?.trim(), "Name and email are required.");
    need(body.password && body.password.length >= 6, "Password must be at least 6 characters.");
    if (users.some((x) => lc(x.email) === lc(body.email))) throw new ApiError("Email is already in use.", 409);
    const { password, ...rest } = body;
    const user = { ...rest, id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, passwordHash: demoHash(password), createdAt: nowISO() };
    writeCollection("users", [...users, user]);
    return safeUser(user);
  },
  "PUT /users/:id": ({ id, body }) => {
    const users = readCollection("users");
    const idx = users.findIndex((x) => x.id === id);
    if (idx < 0) throw new ApiError("User not found.", 404);
    if (body.email && users.some((x) => x.id !== id && lc(x.email) === lc(body.email))) throw new ApiError("Email is already in use.", 409);
    const { password, passwordHash, id: _ignored, createdAt, ...patch } = body;
    void passwordHash; void _ignored; void createdAt;
    // Never allow the last admin to be demoted/blocked.
    const target = users[idx];
    const wasAdmin = target.role === "admin" && target.status === "active";
    const stillAdmin = (patch.role ?? target.role) === "admin" && (patch.status ?? target.status) === "active";
    if (wasAdmin && !stillAdmin && users.filter((u) => u.role === "admin" && u.status === "active").length <= 1)
      throw new ApiError("At least one active admin is required.", 409);
    const updated = { ...target, ...patch };
    if (password) updated.passwordHash = demoHash(password);
    users[idx] = updated;
    writeCollection("users", users);
    return safeUser(updated);
  },
  "DELETE /users/:id": ({ id }) => {
    const users = readCollection("users");
    const target = users.find((x) => x.id === id);
    if (!target) throw new ApiError("User not found.", 404);
    if (target.role === "admin" && users.filter((u) => u.role === "admin").length <= 1)
      throw new ApiError("You cannot delete the last admin.", 409);
    writeCollection("users", users.filter((x) => x.id !== id));
    const providers = readCollection("providers");
    if (providers.some((p) => p.ownerUserId === id))
      writeCollection("providers", providers.map((p) => (p.ownerUserId === id ? { ...p, ownerUserId: null } : p)));
    return { id, deleted: true };
  },

  // PROVIDERS -----------------------------------------------------------------
  "GET /providers": ({ params }) => {
    let items = readCollection("providers");
    if (params.status) items = items.filter((p) => p.status === params.status);
    if (params.category) items = items.filter((p) => p.category === params.category);
    if (params.location) items = items.filter((p) => lc(p.location).includes(lc(params.location).trim()));
    if (params.ids !== undefined && params.ids !== "") {
      const set = new Set(String(params.ids).split(",").map(Number));
      items = items.filter((p) => set.has(p.id));
    }
    if (params.q) {
      const q = lc(params.q).trim();
      items = items.filter(
        (p) => lc(p.name).includes(q) || lc(p.category).includes(q) || lc(p.location).includes(q) || (p.services || []).some((s) => lc(s).includes(q))
      );
    }
    const sorters = {
      rating: (a, b) => b.rating - a.rating,
      reviews: (a, b) => b.reviews - a.reviews,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    if (sorters[params.sort]) items = [...items].sort(sorters[params.sort]);
    return paginate(items, params);
  },
  "GET /providers/:id": ({ id }) => {
    const p = readCollection("providers").find((x) => String(x.id) === String(id));
    if (!p) throw new ApiError("Provider not found.", 404);
    return p;
  },
  "POST /providers": ({ body }) => {
    const providers = readCollection("providers");
    need(body.name?.trim() && body.category && body.location?.trim(), "Name, category and location are required.");
    const provider = {
      rating: 0, reviews: 0, experience: "New", availability: "Available Tomorrow", description: "", services: [], phone: "", status: "active", ownerUserId: null,
      ...body,
      price: Number(body.price) || 0,
      id: nextNumericId(providers),
    };
    writeCollection("providers", [...providers, provider]);
    return provider;
  },
  "PUT /providers/:id": ({ id, body }) => {
    const providers = readCollection("providers");
    const idx = providers.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) throw new ApiError("Provider not found.", 404);
    const { id: _i, ...patch } = body;
    void _i;
    if (patch.price !== undefined) patch.price = Number(patch.price) || 0;
    providers[idx] = { ...providers[idx], ...patch };
    writeCollection("providers", providers);
    if (patch.name) {
      const bookings = readCollection("bookings");
      writeCollection("bookings", bookings.map((b) => (String(b.providerId) === String(id) ? { ...b, providerName: patch.name } : b)));
    }
    return providers[idx];
  },
  "DELETE /providers/:id": ({ id }) => {
    const providers = readCollection("providers");
    if (!providers.some((x) => String(x.id) === String(id))) throw new ApiError("Provider not found.", 404);
    const active = readCollection("bookings").filter((b) => String(b.providerId) === String(id) && (b.status === "pending" || b.status === "confirmed"));
    if (active.length) throw new ApiError(`Cannot delete: ${active.length} active booking(s) exist for this provider. Cancel or complete them first.`, 409);
    writeCollection("providers", providers.filter((x) => String(x.id) !== String(id)));
    const users = readCollection("users");
    writeCollection("users", users.map((u) => (String(u.providerId) === String(id) ? { ...u, providerId: undefined } : u)));
    return { id, deleted: true };
  },

  // CATEGORIES (services) -----------------------------------------------------
  "GET /categories": ({ params }) => {
    const providers = readCollection("providers").filter((p) => p.status === "active");
    let items = readCollection("categories").map((c) => ({ ...c, providersCount: providers.filter((p) => p.category === c.name).length }));
    if (params.q) items = items.filter((c) => lc(c.name).includes(lc(params.q).trim()));
    return paginate(items, params);
  },
  "POST /categories": ({ body }) => {
    const cats = readCollection("categories");
    need(body.name?.trim(), "Category name is required.");
    if (cats.some((c) => lc(c.name) === lc(body.name.trim()))) throw new ApiError("A category with this name already exists.", 409);
    const cat = { id: slug(body.name) || `cat-${Date.now()}`, name: body.name.trim(), icon: body.icon || "🏠", description: body.description || "" };
    writeCollection("categories", [...cats, cat]);
    return cat;
  },
  "PUT /categories/:id": ({ id, body }) => {
    const cats = readCollection("categories");
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) throw new ApiError("Category not found.", 404);
    const oldName = cats[idx].name;
    const name = body.name?.trim() || oldName;
    if (cats.some((c, i) => i !== idx && lc(c.name) === lc(name))) throw new ApiError("A category with this name already exists.", 409);
    cats[idx] = { ...cats[idx], name, icon: body.icon ?? cats[idx].icon, description: body.description ?? cats[idx].description };
    writeCollection("categories", cats);
    if (name !== oldName) {
      writeCollection("providers", readCollection("providers").map((p) => (p.category === oldName ? { ...p, category: name } : p)));
      writeCollection("bookings", readCollection("bookings").map((b) => (b.category === oldName ? { ...b, category: name } : b)));
    }
    return cats[idx];
  },
  "DELETE /categories/:id": ({ id }) => {
    const cats = readCollection("categories");
    const cat = cats.find((c) => c.id === id);
    if (!cat) throw new ApiError("Category not found.", 404);
    const used = readCollection("providers").filter((p) => p.category === cat.name).length;
    if (used) throw new ApiError(`Cannot delete: ${used} provider(s) still use this category. Reassign them first.`, 409);
    writeCollection("categories", cats.filter((c) => c.id !== id));
    return { id, deleted: true };
  },

  // BOOKINGS ------------------------------------------------------------------
  "GET /bookings": ({ params }) => {
    let items = readCollection("bookings");
    if (params.customerId) items = items.filter((b) => b.customerId === params.customerId);
    if (params.providerId) items = items.filter((b) => String(b.providerId) === String(params.providerId));
    if (params.status) items = items.filter((b) => b.status === params.status);
    if (params.q) {
      const q = lc(params.q).trim();
      items = items.filter((b) => [b.id, b.customerName, b.providerName, b.service].some((v) => lc(v).includes(q)));
    }
    items = [...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return paginate(items, params);
  },
  "GET /bookings/:id": ({ id }) => {
    const b = readCollection("bookings").find((x) => x.id === id);
    if (!b) throw new ApiError("Booking not found.", 404);
    return b;
  },
  "POST /bookings": ({ body }) => {
    const bookings = readCollection("bookings");
    need(body.customerId && body.providerId && body.service && body.date && body.time && body.address && body.phone, "Missing required booking fields.");
    const provider = readCollection("providers").find((p) => String(p.id) === String(body.providerId));
    if (!provider) throw new ApiError("Provider not found.", 404);
    if (provider.status !== "active") throw new ApiError("This provider is not accepting bookings right now.", 409);
    if (provider.availability === "Unavailable") throw new ApiError("This provider is currently unavailable. Please try another provider.", 409);
    const dup = bookings.some(
      (b) => b.customerId === body.customerId && b.providerId === provider.id && b.date === body.date && b.time === body.time && (b.status === "pending" || b.status === "confirmed")
    );
    if (dup) throw new ApiError("You already have an active booking with this provider at that date and time.", 409);
    const ts = nowISO();
    const booking = {
      id: nextBookingId(bookings),
      customerId: body.customerId,
      customerName: body.customerName,
      providerId: provider.id,
      providerName: provider.name,
      category: provider.category,
      service: body.service,
      date: body.date,
      time: body.time,
      address: body.address.trim(),
      phone: body.phone,
      notes: (body.notes || "").trim(),
      price: provider.price,
      status: "pending",
      paymentMethod: body.paymentMethod || "Cash after service",
      paymentStatus: "unpaid",
      createdAt: ts,
      updatedAt: ts,
    };
    writeCollection("bookings", [...bookings, booking]);
    return booking;
  },
  "PATCH /bookings/:id/status": ({ id, body }) => {
    const bookings = readCollection("bookings");
    const idx = bookings.findIndex((x) => x.id === id);
    if (idx < 0) throw new ApiError("Booking not found.", 404);
    const current = bookings[idx];
    if (!(LIFECYCLE[current.status] || []).includes(body.status))
      throw new ApiError(`A ${current.status} booking cannot be changed to ${body.status}.`, 409);
    bookings[idx] = {
      ...current,
      status: body.status,
      paymentStatus: body.status === "completed" ? "paid" : current.paymentStatus, // mock: no real payment gateway
      updatedAt: nowISO(),
    };
    writeCollection("bookings", bookings);
    return bookings[idx];
  },
  "PUT /bookings/:id": ({ id, body }) => {
    const bookings = readCollection("bookings");
    const idx = bookings.findIndex((x) => x.id === id);
    if (idx < 0) throw new ApiError("Booking not found.", 404);
    const allowed = ["date", "time", "address", "phone", "notes", "price", "paymentMethod", "paymentStatus", "service"];
    const patch = {};
    allowed.forEach((k) => body[k] !== undefined && (patch[k] = k === "price" ? Number(body[k]) : body[k]));
    bookings[idx] = { ...bookings[idx], ...patch, updatedAt: nowISO() };
    writeCollection("bookings", bookings);
    return bookings[idx];
  },
  "DELETE /bookings/:id": ({ id }) => {
    const bookings = readCollection("bookings");
    if (!bookings.some((x) => x.id === id)) throw new ApiError("Booking not found.", 404);
    writeCollection("bookings", bookings.filter((x) => x.id !== id));
    return { id, deleted: true };
  },
};

export async function mockRequest(method, path, { body, params = {} } = {}) {
  await sleep(LATENCY_MS);
  if (window.localStorage.getItem(STORAGE_KEYS.simulateFailure) === "1")
    throw new ApiError("Simulated network failure. Turn it off in Admin → Dashboard → Developer tools.", 503);

  const [resource, id, sub] = path.split("/").filter(Boolean);
  const pattern =
    resource === "auth" ? `${method} /auth/${id}` : `${method} /${resource}${id ? "/:id" : ""}${sub ? `/${sub}` : ""}`;
  const handler = routes[pattern];
  if (!handler) throw new ApiError(`No mock route for ${method} ${path}`, 404);
  const result = handler({ id, body: body ? JSON.parse(JSON.stringify(body)) : {}, params });
  return JSON.parse(JSON.stringify(result));
}

// Dev helper used by the Admin dashboard: wipe all mock data back to seed state.
export function resetMockDatabase() {
  Object.keys(SEEDERS).forEach((name) => window.localStorage.removeItem(STORAGE_KEYS.dbPrefix + name));
  window.localStorage.removeItem(STORAGE_KEYS.notifications);
  window.localStorage.removeItem(STORAGE_KEYS.session);
}
