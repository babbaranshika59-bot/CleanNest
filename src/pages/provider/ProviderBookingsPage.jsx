import { useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import BookingsExplorer from "../../components/booking/BookingsExplorer.jsx";

const TABS = [
  { key: "all", label: "All", match: () => true },
  { key: "requests", label: "New requests", match: (b) => b.status === "pending" },
  { key: "accepted", label: "Accepted", match: (b) => b.status === "confirmed" },
  { key: "completed", label: "Completed", match: (b) => b.status === "completed" },
  { key: "closed", label: "Cancelled / Rejected", match: (b) => b.status === "cancelled" || b.status === "rejected" },
];

export default function ProviderBookingsPage() {
  useEffect(() => {
    document.title = "Provider Bookings — CleanNest";
  }, []);
  return (
    <DashboardLayout title="Bookings" subtitle="Accept or reject requests, then mark jobs completed.">
      <BookingsExplorer tabs={TABS} emptyTitle="No bookings yet" emptyMessage="Customer requests for your services will show up here." />
    </DashboardLayout>
  );
}
