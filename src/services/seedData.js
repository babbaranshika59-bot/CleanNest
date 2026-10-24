// Seed data for the mock API. Written to localStorage the first time a collection is read
// (or when stored data is missing/corrupt). Demo accounts are listed on the Login page.
import { categories as sampleCategories, providers as sampleProviders } from "../data/sampleData.js";
import { demoHash } from "../utils/hash.js";

const iso = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
};
const dateStr = (daysFromNow) => {
  const d = iso(daysFromNow);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const DEMO_ACCOUNTS = [
  { role: "Customer", email: "customer@cleannest.com", password: "customer123" },
  { role: "Provider", email: "provider@cleannest.com", password: "provider123" },
  { role: "Admin", email: "admin@cleannest.com", password: "admin123" },
];

export function seedUsers() {
  const created = iso(-60).toISOString();
  return [
    { id: "u_admin", name: "Admin User", email: "admin@cleannest.com", phone: "9000000001", address: "CleanNest HQ, Ludhiana", role: "admin", status: "active", passwordHash: demoHash("admin123"), createdAt: created },
    { id: "u_customer1", name: "Priya Singh", email: "customer@cleannest.com", phone: "9876543210", address: "12 Model Town, Ludhiana", role: "customer", status: "active", passwordHash: demoHash("customer123"), createdAt: created },
    { id: "u_customer2", name: "Rohan Mehta", email: "rohan@example.com", phone: "9812345678", address: "45 Civil Lines, Jalandhar", role: "customer", status: "active", passwordHash: demoHash("customer123"), createdAt: created },
    { id: "u_provider1", name: "Amit Verma", email: "provider@cleannest.com", phone: "9855500011", address: "Moga", role: "provider", providerId: 1, status: "active", passwordHash: demoHash("provider123"), createdAt: created },
    { id: "u_provider2", name: "Neha Kapoor", email: "salon@cleannest.com", phone: "9855500022", address: "Moga", role: "provider", providerId: 4, status: "active", passwordHash: demoHash("provider123"), createdAt: created },
  ];
}

export function seedProviders() {
  return sampleProviders.map((p) => ({
    ...p,
    phone: "",
    status: "active",
    ownerUserId: p.id === 1 ? "u_provider1" : p.id === 4 ? "u_provider2" : null,
  }));
}

export function seedCategories() {
  return sampleCategories.map(({ providersCount, ...c }) => {
    void providersCount; // counts are computed live from real providers
    return c;
  });
}

export function seedBookings() {
  const prov = (id) => sampleProviders.find((p) => p.id === id);
  const mk = (n, customer, providerId, status, day, time, extra = {}) => {
    const p = prov(providerId);
    return {
      id: `BK-${1000 + n}`,
      customerId: customer.id,
      customerName: customer.name,
      providerId,
      providerName: p.name,
      category: p.category,
      service: p.services[0],
      date: dateStr(day),
      time,
      address: customer.address,
      phone: customer.phone,
      notes: "",
      price: p.price,
      status,
      paymentMethod: "Cash after service",
      paymentStatus: status === "completed" ? "paid" : "unpaid",
      createdAt: iso(Math.min(day, 0) - 2).toISOString(),
      updatedAt: iso(Math.min(day, 0) - 1).toISOString(),
      ...extra,
    };
  };
  const c1 = { id: "u_customer1", name: "Priya Singh", address: "12 Model Town, Ludhiana", phone: "9876543210" };
  const c2 = { id: "u_customer2", name: "Rohan Mehta", address: "45 Civil Lines, Jalandhar", phone: "9812345678" };
  return [
    mk(1, c1, 1, "pending", 3, "10:00 AM", { notes: "Please bring your own supplies." }),
    mk(2, c1, 4, "confirmed", 1, "02:00 PM", { paymentMethod: "UPI" }),
    mk(3, c1, 6, "completed", -5, "12:00 PM"),
    mk(4, c1, 10, "cancelled", -2, "08:00 AM"),
    mk(5, c2, 1, "confirmed", 2, "04:00 PM"),
    mk(6, c2, 1, "completed", -10, "10:00 AM", { paymentMethod: "Card" }),
    mk(7, c2, 4, "pending", 4, "06:00 PM"),
    mk(8, c2, 1, "rejected", -1, "02:00 PM"),
  ];
}
