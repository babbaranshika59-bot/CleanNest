import { useState } from "react";
import Modal from "./Modal.jsx";
import Button from "./ui/Button.jsx";
import { Input, Select, Textarea, FormError } from "./ui/FormFields.jsx";
import { useRouter } from "../router/Router.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useBookings } from "../context/BookingContext.jsx";
import { useFormState } from "../hooks/useFormState.js";
import { PAYMENT_METHODS, TIME_SLOTS } from "../utils/constants.js";
import { validateBooking } from "../utils/validators.js";
import { formatCurrency, formatDate, todayISO } from "../utils/format.js";
import "../styles/BookingModal.css";

function Gate({ provider, onClose }) {
  const { user } = useAuth();
  const { navigate, route } = useRouter();
  const goto = (path) => {
    onClose();
    navigate(`${path}?next=${encodeURIComponent(route)}`);
  };

  if (!user)
    return (
      <div className="booking-gate">
        <div className="booking-success-icon" aria-hidden="true">🔒</div>
        <h3>Log in to book {provider.name}</h3>
        <p className="muted">Bookings are saved to your dashboard so you can track and manage them.</p>
        <div className="booking-actions">
          <Button variant="primary" onClick={() => goto("/login")}>Log in</Button>
          <Button variant="outline" onClick={() => goto("/signup")}>Create account</Button>
        </div>
      </div>
    );
  return (
    <div className="booking-gate">
      <div className="booking-success-icon" aria-hidden="true">ℹ️</div>
      <h3>Customer account required</h3>
      <p className="muted">You're signed in as {user.role === "admin" ? "an admin" : "a service provider"}. Only customer accounts can book services.</p>
      <Button variant="outline" onClick={onClose}>Close</Button>
    </div>
  );
}

function BookingForm({ provider, onClose }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { createBooking } = useBookings();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState(null);

  const form = useFormState(
    { name: user.name || "", phone: user.phone || "", service: provider.services?.[0] || "", date: "", time: "", paymentMethod: PAYMENT_METHODS[0], address: user.address || "", notes: "" },
    validateBooking
  );

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return; // no duplicate submits
    setFormError("");
    if (!form.validateAll()) return;
    setSubmitting(true);
    const res = await createBooking(form.values, provider);
    setSubmitting(false);
    if (res.ok) setCreated(res.booking);
    else setFormError(res.error);
  };

  if (created)
    return (
      <div className="booking-success">
        <div className="booking-success-icon" aria-hidden="true">✓</div>
        <h3>Booking request submitted!</h3>
        <p className="muted">{provider.name} will review your request. You'll be notified when it is accepted.</p>
        <div className="booking-success-summary">
          <div className="booking-summary-row"><span>Booking ID</span><strong>{created.id}</strong></div>
          <div className="booking-summary-row"><span>Provider</span><strong>{provider.name}</strong></div>
          <div className="booking-summary-row"><span>Service</span><strong>{created.service}</strong></div>
          <div className="booking-summary-row"><span>When</span><strong>{formatDate(created.date)} · {created.time}</strong></div>
          <div className="booking-summary-row"><span>Price</span><strong>{formatCurrency(created.price)} (starting)</strong></div>
        </div>
        <Button block onClick={() => { onClose(); navigate(`/customer/bookings/${created.id}`); }}>View my booking</Button>
        <Button block variant="ghost" onClick={onClose}>Done</Button>
      </div>
    );

  if (provider.availability === "Unavailable" || !provider.services?.length)
    return (
      <div className="booking-gate">
        <div className="booking-success-icon" aria-hidden="true">⏸</div>
        <h3>Not available right now</h3>
        <p className="muted">{provider.name} {provider.availability === "Unavailable" ? "is not taking new bookings at the moment." : "hasn't listed any services yet."} Please try another provider.</p>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    );

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <div className="booking-provider">
        <div className="booking-provider-avatar" aria-hidden="true">{provider.name.charAt(0)}</div>
        <div>
          <span className="booking-provider-label">Booking with</span>
          <strong className="booking-provider-name">{provider.name}</strong>
        </div>
      </div>
      <FormError>{formError}</FormError>

      <div className="booking-grid">
        <Input label="Customer Name" required placeholder="Your full name" autoComplete="name" {...form.field("name")} />
        <Input label="Phone Number" required placeholder="10-digit mobile number" inputMode="tel" {...form.field("phone")} />
        <Select label="Service" required placeholder="Select a service" options={provider.services} {...form.field("service")} />
        <Input label="Preferred Date" required type="date" min={todayISO()} {...form.field("date")} />
        <Select label="Preferred Time" required placeholder="Select a time slot" options={TIME_SLOTS} {...form.field("time")} />
        <Select label="Payment Method" required options={PAYMENT_METHODS} hint="No real payment is taken — demo only." {...form.field("paymentMethod")} />
        <Input label="Address" required className="booking-full" placeholder="House no, street, area, city" {...form.field("address")} />
        <Textarea label="Additional Notes" className="booking-full" placeholder="Anything the professional should know? (optional)" {...form.field("notes")} />
      </div>

      <div className="booking-actions">
        <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>Confirm Booking</Button>
      </div>
    </form>
  );
}

// Props: provider, open, onClose. The body is only mounted while open, so the form resets each time.
export default function BookingModal({ provider, open, onClose }) {
  const { user } = useAuth();
  if (!provider) return null;
  const canBook = user?.role === "customer";
  return (
    <Modal open={open} onClose={onClose} title="Book Your Service" maxWidth={520}>
      {canBook ? <BookingForm provider={provider} onClose={onClose} /> : <Gate provider={provider} onClose={onClose} />}
    </Modal>
  );
}
