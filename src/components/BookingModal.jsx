import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import "../styles/BookingModal.css";

const initialForm = {
  name: "",
  phone: "",
  service: "",
  date: "",
  time: "",
  address: "",
  notes: "",
};

const timeSlots = [
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
];

// Props: provider, open, onClose
export default function BookingModal({ provider, open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Reset the form whenever a new provider/booking session opens
  useEffect(() => {
    if (open) {
      setForm({
        ...initialForm,
        service: provider?.services?.[0] || "",
      });
      setErrors({});
      setSubmitted(false);
    }
  }, [open, provider]);

  if (!provider) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      next.phone = "Enter a valid 10-digit phone number.";
    if (!form.service) next.service = "Select a service.";
    if (!form.date) next.date = "Choose a preferred date.";
    if (!form.time) next.time = "Choose a preferred time.";
    if (!form.address.trim()) next.address = "Enter your address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Book Your Service" maxWidth={520}>
      {submitted ? (
        <div className="booking-success">
          <div className="booking-success-icon" aria-hidden="true">✓</div>
          <h3>Booking Request Submitted!</h3>
          <p className="muted">
            This is a simulated Stage 1 booking — no request was sent to a server.
          </p>
          <div className="booking-success-summary">
            <div className="booking-summary-row">
              <span>Provider</span>
              <strong>{provider.name}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Service</span>
              <strong>{form.service}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Date</span>
              <strong>{form.date}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Time</span>
              <strong>{form.time}</strong>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleClose}>
            Done
          </button>
        </div>
      ) : (
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <div className="booking-provider">
            <div className="booking-provider-avatar" aria-hidden="true">
              {provider.name.charAt(0)}
            </div>
            <div>
              <span className="booking-provider-label">Booking with</span>
              <strong className="booking-provider-name">{provider.name}</strong>
            </div>
          </div>

          <div className="booking-grid">
            <div className="field">
              <label htmlFor="bk-name">Customer Name</label>
              <input
                id="bk-name"
                className="input"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="field">
              <label htmlFor="bk-phone">Phone Number</label>
              <input
                id="bk-phone"
                className="input"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="10-digit mobile number"
                inputMode="tel"
              />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>

            <div className="field">
              <label htmlFor="bk-service">Service</label>
              <select
                id="bk-service"
                className="select"
                value={form.service}
                onChange={handleChange("service")}
              >
                <option value="">Select a service</option>
                {provider.services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service && <div className="field-error">{errors.service}</div>}
            </div>

            <div className="field">
              <label htmlFor="bk-date">Preferred Date</label>
              <input
                id="bk-date"
                className="input"
                type="date"
                value={form.date}
                onChange={handleChange("date")}
              />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </div>

            <div className="field">
              <label htmlFor="bk-time">Preferred Time</label>
              <select
                id="bk-time"
                className="select"
                value={form.time}
                onChange={handleChange("time")}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.time && <div className="field-error">{errors.time}</div>}
            </div>

            <div className="field booking-full">
              <label htmlFor="bk-address">Address</label>
              <input
                id="bk-address"
                className="input"
                value={form.address}
                onChange={handleChange("address")}
                placeholder="House no, street, area, city"
              />
              {errors.address && <div className="field-error">{errors.address}</div>}
            </div>

            <div className="field booking-full">
              <label htmlFor="bk-notes">Additional Notes</label>
              <textarea
                id="bk-notes"
                className="textarea"
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Anything the professional should know? (optional)"
              />
            </div>
          </div>

          <div className="booking-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
