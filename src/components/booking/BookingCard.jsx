import { Link } from "../../router/Router.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { allowedTransitions } from "../../utils/bookingRules.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { BOOKINGS_BASE } from "../../config/navigation.js";
import "../../styles/Booking.css";

const ACTION_UI = {
  confirmed: { label: "Accept", variant: "primary" },
  completed: { label: "Mark completed", variant: "primary" },
  rejected: { label: "Reject", variant: "danger-outline" },
  cancelled: { label: "Cancel booking", variant: "danger-outline" },
};

// One booking, shown consistently to every role. Actions are derived from the lifecycle rules.
export default function BookingCard({ booking, onAction, busy, compact }) {
  const { user } = useAuth();
  const role = user?.role;
  const base = BOOKINGS_BASE[role] || "/customer/bookings";
  const actions = allowedTransitions(booking, user);
  const counterpart = role === "customer" ? `with ${booking.providerName}` : `for ${booking.customerName}`;

  return (
    <article className={`booking-card booking-${booking.status}`}>
      <header className="booking-card-head">
        <span className="booking-id">{booking.id}</span>
        <StatusBadge status={booking.status} />
      </header>
      <h3 className="booking-card-title">{booking.service}</h3>
      <p className="booking-card-sub">{booking.category} · {counterpart}</p>

      <ul className="booking-card-meta">
        <li><span aria-hidden="true">📅</span> {formatDate(booking.date)} · {booking.time}</li>
        {!compact && <li className="booking-card-address"><span aria-hidden="true">📍</span> {booking.address}</li>}
        <li><span aria-hidden="true">💰</span> {formatCurrency(booking.price)}</li>
      </ul>

      <footer className="booking-card-actions">
        <Link to={`${base}/${booking.id}`} className="btn btn-outline btn-sm">View details</Link>
        {onAction &&
          actions.map((status) => {
            const ui = ACTION_UI[status];
            return (
              <Button key={status} size="sm" variant={ui.variant} loading={busy} onClick={() => onAction(booking, status)}>
                {ui.label}
              </Button>
            );
          })}
      </footer>
    </article>
  );
}
