import { useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import BookingList from "../../components/booking/BookingList.jsx";
import { ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { Link } from "../../router/Router.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBookings } from "../../context/BookingContext.jsx";
import { useBookingActions } from "../../hooks/useBookingActions.jsx";
import { countByStatus } from "../../utils/bookingRules.js";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { bookings, loading, error, reload } = useBookings();
  const { run, modal, busyId } = useBookingActions();

  useEffect(() => {
    document.title = "My Dashboard — CleanNest";
  }, []);

  const c = countByStatus(bookings);
  const recent = bookings.slice(0, 3); // context list is already newest-first

  return (
    <DashboardLayout
      title={`Welcome back, ${user.name.split(" ")[0]} 👋`}
      subtitle="Here's what's happening with your home service bookings."
      actions={<Link to="/providers" className="btn btn-primary">Book a service</Link>}
    >
      {loading && !bookings.length ? (
        <LoadingState label="Loading your dashboard…" />
      ) : error && !bookings.length ? (
        <ErrorState error={error} onRetry={reload} title="Couldn't load your bookings" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total bookings" value={c.total} icon="📅" />
            <StatCard label="Pending" value={c.pending} icon="⏳" tone="pending" />
            <StatCard label="Confirmed" value={c.confirmed} icon="✅" tone="confirmed" />
            <StatCard label="Completed" value={c.completed} icon="🏁" tone="completed" />
            <StatCard label="Cancelled / Rejected" value={c.cancelled + c.rejected} icon="✖" tone="cancelled" />
          </div>

          <div className="dash-section-head">
            <h2>Recent bookings</h2>
            {bookings.length > 0 && <Link to="/customer/bookings" className="link-btn">View all →</Link>}
          </div>
          <BookingList
            bookings={recent}
            onAction={run}
            busyId={busyId}
            compact
            emptyTitle="You haven't booked anything yet"
            emptyMessage="Browse trusted local professionals and send your first booking request."
            emptyAction={<Link to="/providers" className="btn btn-primary">Browse providers</Link>}
          />
          {modal}
        </>
      )}
    </DashboardLayout>
  );
}
