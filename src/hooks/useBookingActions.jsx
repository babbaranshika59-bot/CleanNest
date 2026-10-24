import { useState } from "react";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import { useBookings } from "../context/BookingContext.jsx";

const CONFIRM_COPY = {
  cancelled: { title: "Cancel this booking?", label: "Yes, cancel booking", text: "The provider will be notified. This cannot be undone." },
  rejected: { title: "Reject this request?", label: "Yes, reject request", text: "The customer will be notified that you declined this request." },
};

// Shared action runner for booking cards / tables / details pages.
// Cancel + reject ask for confirmation; accept + complete run immediately.
export function useBookingActions() {
  const { updateStatus } = useBookings();
  const [pending, setPending] = useState(null); // { booking, status }
  const [busyId, setBusyId] = useState(null);

  const execute = async (booking, status) => {
    setBusyId(booking.id);
    const res = await updateStatus(booking.id, status);
    setBusyId(null);
    return res;
  };

  const run = (booking, status) => {
    if (CONFIRM_COPY[status]) setPending({ booking, status });
    else execute(booking, status);
  };

  const confirm = async () => {
    const { booking, status } = pending;
    await execute(booking, status);
    setPending(null);
  };

  const copy = pending ? CONFIRM_COPY[pending.status] : null;
  const modal = (
    <ConfirmModal
      open={!!pending}
      title={copy?.title}
      message={pending ? `${copy.text} (Booking ${pending.booking.id})` : ""}
      confirmLabel={copy?.label}
      loading={!!busyId}
      onConfirm={confirm}
      onCancel={() => setPending(null)}
    />
  );

  return { run, modal, busyId };
}
