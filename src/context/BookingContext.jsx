import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { bookingService } from "../services/bookingService.js";
import { useAuth } from "./AuthContext.jsx";
import { useNotifications } from "./NotificationContext.jsx";
import { allowedTransitions, canDeleteBooking, canEditBooking, canViewBooking } from "../utils/bookingRules.js";
import { STATUS_LABELS } from "../utils/constants.js";

const BookingContext = createContext(null);

// ONE shared booking list for every role. The context exposes only what the signed-in user may
// see (customer → own, provider → own provider's, admin → all). Every mutation goes through the
// service layer, updates this shared state, and emits toast + persisted notifications.
// (Frontend permission checks are a demo; a real backend must enforce them.)
export function BookingProvider({ children }) {
  const { user } = useAuth();
  const { toast, notify } = useNotifications();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const submitting = useRef(false); // blocks double-submits

  const load = useCallback(async () => {
    if (!user) {
      setAllBookings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.list();
      setAllBookings(res.items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const bookings = useMemo(() => allBookings.filter((b) => canViewBooking(b, user)), [allBookings, user]);
  const getBooking = useCallback((id) => bookings.find((b) => b.id === id) || null, [bookings]);
  const replace = (updated) => setAllBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));

  const fail = (err) => {
    toast(err.message || "Something went wrong.", "error");
    return { ok: false, error: err.message || "Something went wrong." };
  };

  const createBooking = useCallback(
    async (form, provider) => {
      if (!user || user.role !== "customer") return fail({ message: "Only customers can create bookings." });
      if (submitting.current) return { ok: false, error: "Already submitting." };
      submitting.current = true;
      try {
        const booking = await bookingService.create({
          customerId: user.id,
          customerName: form.name.trim(),
          providerId: provider.id,
          service: form.service,
          date: form.date,
          time: form.time,
          address: form.address,
          phone: form.phone.replace(/\D/g, ""),
          notes: form.notes,
          paymentMethod: form.paymentMethod,
        });
        setAllBookings((prev) => [booking, ...prev]);
        toast(`Booking ${booking.id} submitted to ${provider.name}.`, "success");
        notify({ to: { userId: user.id }, type: "success", message: `Your booking ${booking.id} with ${provider.name} was submitted.`, link: `/customer/bookings/${booking.id}` });
        notify({ to: { providerId: provider.id }, type: "info", message: `New booking request ${booking.id} from ${booking.customerName}.`, link: `/provider/bookings/${booking.id}` });
        return { ok: true, booking };
      } catch (err) {
        return fail(err);
      } finally {
        submitting.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, toast, notify]
  );

  const updateStatus = useCallback(
    async (id, nextStatus) => {
      const current = allBookings.find((b) => b.id === id);
      if (!current) return fail({ message: "Booking not found." });
      if (!allowedTransitions(current, user).includes(nextStatus))
        return fail({ message: "You are not allowed to make this change." });
      try {
        const updated = await bookingService.updateStatus(id, nextStatus);
        replace(updated);
        const label = STATUS_LABELS[nextStatus].toLowerCase();
        const verb = { confirmed: "accepted", rejected: "rejected", completed: "marked as completed", cancelled: "cancelled" }[nextStatus];
        toast(`Booking ${id} ${verb}.`, "success");
        const actorIsCustomer = user.role === "customer";
        if (actorIsCustomer) {
          notify({ to: { providerId: updated.providerId }, type: "warning", message: `${updated.customerName} cancelled booking ${id}.`, link: `/provider/bookings/${id}` });
        } else {
          notify({ to: { userId: updated.customerId }, type: nextStatus === "rejected" || nextStatus === "cancelled" ? "warning" : "success", message: `Your booking ${id} was ${verb} by ${user.role === "admin" ? "an admin" : updated.providerName}.`, link: `/customer/bookings/${id}` });
        }
        void label;
        return { ok: true, booking: updated };
      } catch (err) {
        return fail(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allBookings, user, toast, notify]
  );

  const updateBooking = useCallback(
    async (id, patch) => {
      if (!canEditBooking(user)) return fail({ message: "Only admins can edit booking details." });
      try {
        const updated = await bookingService.update(id, patch);
        replace(updated);
        toast(`Booking ${id} updated.`, "success");
        notify({ to: { userId: updated.customerId }, type: "info", message: `Details of booking ${id} were updated by an admin.`, link: `/customer/bookings/${id}` });
        return { ok: true, booking: updated };
      } catch (err) {
        return fail(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, toast, notify]
  );

  const deleteBooking = useCallback(
    async (id) => {
      if (!canDeleteBooking(user)) return fail({ message: "Only admins can delete bookings." });
      try {
        await bookingService.remove(id);
        setAllBookings((prev) => prev.filter((b) => b.id !== id));
        toast(`Booking ${id} deleted.`, "success");
        return { ok: true };
      } catch (err) {
        return fail(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, toast]
  );

  const value = useMemo(
    () => ({ bookings, loading, error, reload: load, getBooking, createBooking, updateStatus, updateBooking, deleteBooking }),
    [bookings, loading, error, load, getBooking, createBooking, updateStatus, updateBooking, deleteBooking]
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
}
