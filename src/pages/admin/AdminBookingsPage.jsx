import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FilterBar from "../../components/ui/FilterBar.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { Input, Select, Textarea } from "../../components/ui/FormFields.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { Link } from "../../router/Router.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBookings } from "../../context/BookingContext.jsx";
import { useBookingActions } from "../../hooks/useBookingActions.jsx";
import { useFormState } from "../../hooks/useFormState.js";
import { useListControls } from "../../hooks/useListControls.js";
import { allowedTransitions } from "../../utils/bookingRules.js";
import { PAYMENT_METHODS, STATUS_LABELS, TIME_SLOTS } from "../../utils/constants.js";
import { validateBookingEdit } from "../../utils/validators.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const NEXT_LABEL = { confirmed: "Accept", completed: "Mark completed", rejected: "Reject", cancelled: "Cancel" };

function BookingEditForm({ booking, busy, onCancel, onSubmit }) {
  const form = useFormState({ ...booking }, validateBookingEdit);
  const submit = (e) => {
    e.preventDefault();
    if (!form.validateAll()) return;
    const { date, time, address, phone, notes, price, paymentMethod, paymentStatus } = form.values;
    onSubmit({ date, time, address, phone, notes, price: Number(price), paymentMethod, paymentStatus });
  };
  return (
    <form onSubmit={submit} noValidate className="stack">
      <div className="form-grid">
        <Input label="Date" type="date" required {...form.field("date")} />
        <Select label="Time" required options={TIME_SLOTS} {...form.field("time")} />
        <Input label="Contact phone" inputMode="tel" required {...form.field("phone")} />
        <Input label="Price (₹)" type="number" min="1" required {...form.field("price")} />
        <Select label="Payment method" options={PAYMENT_METHODS} {...form.field("paymentMethod")} />
        <Select label="Payment status" options={[{ value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }]} {...form.field("paymentStatus")} />
        <Input label="Address" required className="form-full" {...form.field("address")} />
        <Textarea label="Notes" className="form-full" {...form.field("notes")} />
      </div>
      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>Save changes</Button>
      </div>
    </form>
  );
}

// Admin view of the SAME shared booking list used by customers and providers.
export default function AdminBookingsPage() {
  const { user } = useAuth();
  const { bookings, loading, error, reload, updateBooking, deleteBooking } = useBookings();
  const { run, modal } = useBookingActions();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Manage Bookings — CleanNest";
  }, []);

  const ctl = useListControls(bookings, {
    searchFields: [(b) => b.id, (b) => b.customerName, (b) => b.providerName, (b) => b.service],
    filters: { status: (b, v) => b.status === v, category: (b, v) => b.category === v },
    sortAccessors: { id: (b) => b.id, date: (b) => `${b.date} ${b.time}`, price: (b) => b.price, createdAt: (b) => b.createdAt },
    defaultSort: { key: "createdAt", dir: "desc" },
    pageSize: 8,
  });
  const categories = [...new Set(bookings.map((b) => b.category))];

  const columns = [
    { key: "id", label: "ID", sortable: true, render: (b) => <Link to={`/admin/bookings/${b.id}`} className="table-link">{b.id}</Link> },
    { key: "customerName", label: "Customer" },
    { key: "providerName", label: "Provider", render: (b) => (<>{b.providerName}<div className="muted small">{b.service}</div></>) },
    { key: "date", label: "Date", sortable: true, render: (b) => (<>{formatDate(b.date)}<div className="muted small">{b.time}</div></>) },
    { key: "price", label: "Price", sortable: true, render: (b) => formatCurrency(b.price) },
    { key: "status", label: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions", label: "Actions", className: "col-actions",
      render: (b) => {
        const next = allowedTransitions(b, user);
        return (
          <div className="row-actions">
            {next.length > 0 && (
              <select className="select select-sm" value="" aria-label={`Change status of ${b.id}`} onChange={(e) => e.target.value && run(b, e.target.value)}>
                <option value="">Change status…</option>
                {next.map((s) => <option key={s} value={s}>{NEXT_LABEL[s]}</option>)}
              </select>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(b)}>Edit</Button>
            <Button size="sm" variant="danger-outline" onClick={() => setDeleting(b)}>Delete</Button>
          </div>
        );
      },
    },
  ];

  let body;
  if (loading && !bookings.length) body = <LoadingState label="Loading bookings…" />;
  else if (error && !bookings.length) body = <ErrorState error={error} onRetry={reload} title="Couldn't load bookings" />;
  else
    body = (
      <>
        <FilterBar
          search={ctl.search} onSearch={ctl.setSearch} placeholder="Search ID, customer, provider, service…"
          filters={[
            { key: "status", label: "All statuses", value: ctl.filterValues.status, onChange: (v) => ctl.setFilter("status", v), options: STATUS_OPTIONS },
            { key: "category", label: "All categories", value: ctl.filterValues.category, onChange: (v) => ctl.setFilter("category", v), options: categories },
          ]}
          hasActive={ctl.hasActiveFilters} onClear={ctl.clear} total={ctl.total} noun="booking"
        />
        {ctl.results.length === 0 ? (
          <EmptyState icon="📅" title={bookings.length ? "No bookings match" : "No bookings yet"} message={bookings.length ? "Try different search terms or clear the filters." : "Bookings made by customers will appear here."} action={bookings.length ? <Button variant="outline" onClick={ctl.clear}>Clear filters</Button> : undefined} />
        ) : (
          <DataTable columns={columns} rows={ctl.results} sort={ctl.sort} onSort={ctl.toggleSort} caption="All bookings" />
        )}
        <Pagination page={ctl.page} totalPages={ctl.totalPages} onPage={ctl.setPage} />
      </>
    );

  return (
    <DashboardLayout title="All Bookings" subtitle="Every booking across customers and providers.">
      {body}
      <Modal open={!!editing} onClose={() => !busy && setEditing(null)} title={editing ? `Edit ${editing.id}` : ""} maxWidth={620}>
        {editing && (
          <BookingEditForm key={editing.id} booking={editing} busy={busy} onCancel={() => setEditing(null)}
            onSubmit={async (patch) => { setBusy(true); const res = await updateBooking(editing.id, patch); setBusy(false); if (res.ok) setEditing(null); }} />
        )}
      </Modal>
      <ConfirmModal
        open={!!deleting} title="Delete booking?" message={deleting ? `Booking ${deleting.id} will be removed for the customer and provider as well.` : ""}
        confirmLabel="Delete booking" loading={busy} onCancel={() => setDeleting(null)}
        onConfirm={async () => { setBusy(true); await deleteBooking(deleting.id); setBusy(false); setDeleting(null); }}
      />
      {modal}
    </DashboardLayout>
  );
}
