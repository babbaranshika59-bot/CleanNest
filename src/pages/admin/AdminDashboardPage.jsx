import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import Button from "../../components/ui/Button.jsx";
import { ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { Link } from "../../router/Router.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBookings } from "../../context/BookingContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { userService } from "../../services/userService.js";
import { providerService } from "../../services/providerService.js";
import { serviceService } from "../../services/serviceService.js";
import { USING_MOCK_API } from "../../services/apiClient.js";
import { resetMockDatabase } from "../../services/mockServer.js";
import { countByStatus } from "../../utils/bookingRules.js";
import { STORAGE_KEYS } from "../../utils/constants.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { info } = useNotifications();
  const [failing, setFailing] = useState(() => window.localStorage.getItem(STORAGE_KEYS.simulateFailure) === "1");
  const [confirmReset, setConfirmReset] = useState(false);

  const req = useAsync(async () => {
    const [users, providers, services] = await Promise.all([userService.list(), providerService.list(), serviceService.list()]);
    return { users: users.total, providers: providers.total, activeProviders: providers.items.filter((p) => p.status === "active").length, services: services.total };
  }, [failing]);

  useEffect(() => {
    document.title = "Admin Dashboard — CleanNest";
  }, []);

  const c = countByStatus(bookings);
  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0);

  const toggleFailure = () => {
    const next = !failing;
    if (next) window.localStorage.setItem(STORAGE_KEYS.simulateFailure, "1");
    else window.localStorage.removeItem(STORAGE_KEYS.simulateFailure);
    setFailing(next);
    info(next ? "Network failure simulation ON — API calls will fail." : "Network failure simulation OFF.");
  };

  const recentCols = [
    { key: "id", label: "ID", render: (b) => <Link to={`/admin/bookings/${b.id}`} className="table-link">{b.id}</Link> },
    { key: "customerName", label: "Customer" },
    { key: "providerName", label: "Provider" },
    { key: "date", label: "Date", render: (b) => formatDate(b.date) },
    { key: "status", label: "Status", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <DashboardLayout title={`Admin overview`} subtitle={`Signed in as ${user.name}. Platform-wide statistics at a glance.`}>
      {req.loading && !req.data ? (
        <LoadingState label="Loading statistics…" />
      ) : req.error && !req.data ? (
        <ErrorState error={req.error} onRetry={req.reload} title="Couldn't load statistics" />
      ) : (
        <div className="stat-grid">
          <StatCard label="Users" value={req.data.users} icon="👥" />
          <StatCard label="Providers" value={req.data.providers} icon="🧰" hint={`${req.data.activeProviders} active`} />
          <StatCard label="Service categories" value={req.data.services} icon="🏷️" />
          <StatCard label="Total bookings" value={c.total} icon="📅" />
          <StatCard label="Pending" value={c.pending} icon="⏳" tone="pending" />
          <StatCard label="Completed" value={c.completed} icon="🏁" tone="completed" />
          <StatCard label="Revenue (completed)" value={formatCurrency(revenue)} icon="💰" tone="confirmed" hint="Sum of starting prices" />
        </div>
      )}

      <div className="dash-section-head"><h2>Latest bookings</h2><Link to="/admin/bookings" className="link-btn">Manage all →</Link></div>
      {bookings.length === 0 ? <p className="muted">No bookings yet.</p> : <DataTable columns={recentCols} rows={bookings.slice(0, 5)} caption="Latest bookings" />}

      <div className="dash-section-head"><h2>Developer tools</h2></div>
      <div className="panel dev-tools">
        <p className="muted">
          Data source: <strong>{USING_MOCK_API ? "in-browser mock REST API (localStorage)" : "real API via fetch()"}</strong>. Admin permissions here are enforced in the UI only —
          a real backend must enforce them.
        </p>
        <div className="form-actions" style={{ justifyContent: "flex-start" }}>
          <Button variant={failing ? "danger" : "outline"} onClick={toggleFailure}>{failing ? "Stop simulating network failure" : "Simulate network failure"}</Button>
          <Button variant="danger-outline" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
        </div>
        <p className="muted small">Turn on failure simulation, then open any list to see the error state and the “Try again” retry button.</p>
      </div>
      <ConfirmModal
        open={confirmReset} title="Reset all demo data?" message="This restores the original sample users, providers, categories and bookings, and signs you out."
        confirmLabel="Reset & sign out" onCancel={() => setConfirmReset(false)}
        onConfirm={() => { resetMockDatabase(); window.location.hash = "/login"; window.location.reload(); }}
      />
    </DashboardLayout>
  );
}
