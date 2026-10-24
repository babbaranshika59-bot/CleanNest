import { useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import BookingList from "../../components/booking/BookingList.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { Link } from "../../router/Router.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBookings } from "../../context/BookingContext.jsx";
import { useBookingActions } from "../../hooks/useBookingActions.jsx";
import { countByStatus } from "../../utils/bookingRules.js";
import { formatCurrency } from "../../utils/format.js";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const { bookings, loading, error, reload } = useBookings();
  const { run, modal, busyId } = useBookingActions();

  useEffect(() => {
    document.title = "Provider Dashboard — CleanNest";
  }, []);

  const c = countByStatus(bookings);
  const requests = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "confirmed");
  const completed = bookings.filter((b) => b.status === "completed");
  const earnings = completed.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  let body;
  if (!user.providerId) {
    body = (
      <EmptyState icon="🧰" title="No provider profile linked" message="Ask an admin to link a provider profile to your account, or create your business profile." action={<Link to="/provider/profile" className="btn btn-primary">Open profile</Link>} />
    );
  } else if (loading && !bookings.length) body = <LoadingState label="Loading your dashboard…" />;
  else if (error && !bookings.length) body = <ErrorState error={error} onRetry={reload} />;
  else
    body = (
      <>
        <div className="stat-grid">
          <StatCard label="Total bookings" value={c.total} icon="📅" />
          <StatCard label="New requests" value={c.pending} icon="🔔" tone="pending" />
          <StatCard label="Accepted" value={c.confirmed} icon="✅" tone="confirmed" />
          <StatCard label="Completed" value={c.completed} icon="🏁" tone="completed" />
          <StatCard label="Earned (completed)" value={formatCurrency(earnings)} icon="💰" hint="Based on starting prices" />
        </div>

        <div className="dash-section-head"><h2>New booking requests</h2><span className="muted">{requests.length} waiting</span></div>
        <BookingList bookings={requests} onAction={run} busyId={busyId} emptyTitle="No new requests" emptyMessage="New customer requests will appear here." />

        <div className="dash-section-head"><h2>Accepted — upcoming work</h2><Link to="/provider/bookings" className="link-btn">All bookings →</Link></div>
        <BookingList bookings={accepted} onAction={run} busyId={busyId} emptyTitle="Nothing scheduled" emptyMessage="Accept a request to see it here." />

        <div className="dash-section-head"><h2>Recently completed</h2></div>
        <BookingList bookings={completed.slice(0, 3)} compact emptyTitle="No completed jobs yet" />
        {modal}
      </>
    );

  return (
    <DashboardLayout title={`Hello, ${user.name.split(" ")[0]}`} subtitle="Manage booking requests and keep your services up to date.">
      {body}
    </DashboardLayout>
  );
}
