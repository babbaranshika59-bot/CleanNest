import { useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import BookingsExplorer from "../../components/booking/BookingsExplorer.jsx";
import { Link } from "../../router/Router.jsx";

const TABS = [
  { key: "all", label: "All", match: () => true },
  { key: "pending", label: "Pending", match: (b) => b.status === "pending" },
  { key: "confirmed", label: "Confirmed", match: (b) => b.status === "confirmed" },
  { key: "completed", label: "Completed", match: (b) => b.status === "completed" },
  { key: "cancelled", label: "Cancelled", match: (b) => b.status === "cancelled" || b.status === "rejected" },
];

export default function MyBookingsPage() {
  useEffect(() => {
    document.title = "My Bookings — CleanNest";
  }, []);
  return (
    <DashboardLayout title="My Bookings" subtitle="Track, review and cancel your service requests." actions={<Link to="/providers" className="btn btn-primary">New booking</Link>}>
      <BookingsExplorer
        tabs={TABS}
        emptyTitle="No bookings yet"
        emptyMessage="When you book a provider, your request will appear here."
        emptyAction={<Link to="/providers" className="btn btn-primary">Browse providers</Link>}
      />
    </DashboardLayout>
  );
}
