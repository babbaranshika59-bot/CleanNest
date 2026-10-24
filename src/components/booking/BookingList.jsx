import BookingCard from "./BookingCard.jsx";
import { EmptyState } from "../ui/States.jsx";

// Grid of BookingCards with an empty state. `onAction(booking, nextStatus)` is optional.
export default function BookingList({ bookings, onAction, busyId, compact, emptyTitle = "No bookings yet", emptyMessage, emptyAction }) {
  if (!bookings.length) return <EmptyState icon="📅" title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  return (
    <div className="booking-grid-list">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} onAction={onAction} busy={busyId === b.id} compact={compact} />
      ))}
    </div>
  );
}
