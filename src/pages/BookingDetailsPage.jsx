import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States.jsx";
import { Link, useRouter } from "../router/Router.jsx";
import { useParams } from "../router/ParamsContext.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useBookings } from "../context/BookingContext.jsx";
import { useBookingActions } from "../hooks/useBookingActions.jsx";
import { allowedTransitions, canDeleteBooking } from "../utils/bookingRules.js";
import { BOOKINGS_BASE } from "../config/navigation.js";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format.js";
import "../styles/Booking.css";

const ACTION_LABEL = { confirmed: "Accept request", completed: "Mark as completed", rejected: "Reject request", cancelled: "Cancel booking" };
const STEPS = ["pending", "confirmed", "completed"];

function Timeline({ status }) {
  if (status === "cancelled" || status === "rejected") {
    return (
      <ol className="timeline">
        <li className="done"><span>1</span>Requested</li>
        <li className="stopped"><span>✕</span>{status === "cancelled" ? "Cancelled" : "Rejected"}</li>
      </ol>
    );
  }
  const idx = STEPS.indexOf(status);
  return (
    <ol className="timeline">
      {STEPS.map((s, i) => (
        <li key={s} className={i < idx ? "done" : i === idx ? "current" : ""}>
          <span>{i < idx ? "✓" : i + 1}</span>
          {{ pending: "Requested", confirmed: "Confirmed", completed: "Completed" }[s]}
        </li>
      ))}
    </ol>
  );
}

// One details page shared by customer, provider and admin (same data, role-aware actions).
export default function BookingDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { bookings, getBooking, loading, error, reload, deleteBooking } = useBookings();
  const { run, modal, busyId } = useBookingActions();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const base = BOOKINGS_BASE[user.role];
  const booking = getBooking(id);

  useEffect(() => {
    document.title = `Booking ${id} — CleanNest`;
  }, [id]);

  let body;
  if (loading && !bookings.length) body = <LoadingState label="Loading booking…" />;
  else if (error && !bookings.length) body = <ErrorState error={error} onRetry={reload} />;
  else if (!booking)
    body = (
      <EmptyState icon="🔎" title="Booking not found" message="It may have been deleted, or it doesn't belong to your account." action={<Link to={base} className="btn btn-primary">Back to bookings</Link>} />
    );
  else {
    const actions = allowedTransitions(booking, user);
    const paymentLabel = booking.status === "cancelled" || booking.status === "rejected" ? "Not applicable" : booking.paymentStatus === "paid" ? "Paid" : "Unpaid";
    body = (
      <>
        <div className="panel">
          <div className="details-top">
            <div>
              <span className="booking-id">{booking.id}</span>
              <h2 className="details-title">{booking.service}</h2>
              <p className="muted">{booking.category}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <Timeline status={booking.status} />
          {(actions.length > 0 || canDeleteBooking(user)) && (
            <div className="details-actions">
              {actions.map((s) => (
                <Button key={s} variant={s === "cancelled" || s === "rejected" ? "danger-outline" : "primary"} loading={busyId === booking.id} onClick={() => run(booking, s)}>
                  {ACTION_LABEL[s]}
                </Button>
              ))}
              {canDeleteBooking(user) && <Button variant="danger-outline" onClick={() => setConfirmDelete(true)}>Delete booking</Button>}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Booking information</h3>
          <dl className="info-grid">
            <div><dt>Provider</dt><dd>{booking.providerName}</dd></div>
            <div><dt>Customer</dt><dd>{booking.customerName}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(booking.date)}</dd></div>
            <div><dt>Time</dt><dd>{booking.time}</dd></div>
            <div><dt>Contact phone</dt><dd>{booking.phone}</dd></div>
            <div><dt>Price</dt><dd>{formatCurrency(booking.price)} <span className="muted">(starting price)</span></dd></div>
            <div><dt>Payment method</dt><dd>{booking.paymentMethod}</dd></div>
            <div><dt>Payment status</dt><dd>{paymentLabel}</dd></div>
            <div className="info-full"><dt>Service address</dt><dd>{booking.address}</dd></div>
            <div className="info-full"><dt>Additional notes</dt><dd>{booking.notes || <span className="muted">None</span>}</dd></div>
            <div><dt>Created</dt><dd>{formatDateTime(booking.createdAt)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDateTime(booking.updatedAt)}</dd></div>
          </dl>
        </div>

        <ConfirmModal
          open={confirmDelete}
          title="Delete this booking?"
          message={`Booking ${booking.id} will be permanently removed for the customer and provider too.`}
          confirmLabel="Delete booking"
          loading={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setDeleting(true);
            const res = await deleteBooking(booking.id);
            setDeleting(false);
            setConfirmDelete(false);
            if (res.ok) navigate(base);
          }}
        />
        {modal}
      </>
    );
  }

  return (
    <DashboardLayout title="Booking details" actions={<Link to={base} className="btn btn-outline">← All bookings</Link>}>
      {body}
    </DashboardLayout>
  );
}
