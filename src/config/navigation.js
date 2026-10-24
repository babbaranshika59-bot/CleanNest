// Sidebar navigation per role. `exact` links are only active on an exact path match.
export const DASHBOARD_NAV = {
  customer: [
    { label: "Overview", to: "/customer", icon: "🏠", exact: true },
    { label: "My Bookings", to: "/customer/bookings", icon: "📅" },
    { label: "My Profile", to: "/customer/profile", icon: "👤" },
    { label: "Find Providers", to: "/providers", icon: "🔍" },
  ],
  provider: [
    { label: "Overview", to: "/provider", icon: "🏠", exact: true },
    { label: "Bookings", to: "/provider/bookings", icon: "📅" },
    { label: "Profile & Services", to: "/provider/profile", icon: "🛠️" },
  ],
  admin: [
    { label: "Overview", to: "/admin", icon: "📊", exact: true },
    { label: "Users", to: "/admin/users", icon: "👥" },
    { label: "Providers", to: "/admin/providers", icon: "🧰" },
    { label: "Services", to: "/admin/services", icon: "🏷️" },
    { label: "Bookings", to: "/admin/bookings", icon: "📅" },
  ],
};

export const BOOKINGS_BASE = {
  customer: "/customer/bookings",
  provider: "/provider/bookings",
  admin: "/admin/bookings",
};
