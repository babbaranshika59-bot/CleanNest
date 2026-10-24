import { useEffect, useMemo, useState } from "react";
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
import { useAsync } from "../../hooks/useAsync.js";
import { useCrudActions } from "../../hooks/useCrudActions.js";
import { useFormState } from "../../hooks/useFormState.js";
import { useListControls } from "../../hooks/useListControls.js";
import { providerService } from "../../services/providerService.js";
import { serviceService } from "../../services/serviceService.js";
import { AVAILABILITY_OPTIONS } from "../../utils/constants.js";
import { validateProviderBusiness } from "../../utils/validators.js";
import { formatCurrency } from "../../utils/format.js";

const STATUS_OPTIONS = [{ value: "active", label: "Active (listed)" }, { value: "inactive", label: "Inactive (hidden)" }];

function ProviderForm({ provider, categories, busy, onCancel, onSubmit }) {
  const form = useFormState(
    provider
      ? { ...provider, services: (provider.services || []).join(", ") }
      : { name: "", category: "", location: "", price: "", experience: "", phone: "", description: "", availability: "Available Tomorrow", status: "active", services: "" },
    validateProviderBusiness
  );
  const submit = (e) => {
    e.preventDefault();
    if (!form.validateAll()) return;
    const services = form.values.services.split(",").map((s) => s.trim()).filter(Boolean);
    onSubmit({ ...form.values, price: Number(form.values.price), services });
  };
  return (
    <form onSubmit={submit} noValidate className="stack">
      <div className="form-grid">
        <Input label="Business name" required {...form.field("name")} />
        <Select label="Category" required placeholder="Select category" options={categories.map((c) => c.name)} {...form.field("category")} />
        <Input label="Location" required {...form.field("location")} />
        <Input label="Starting price (₹)" type="number" min="1" required {...form.field("price")} />
        <Input label="Experience" required placeholder="e.g. 5 years" {...form.field("experience")} />
        <Input label="Phone" inputMode="tel" {...form.field("phone")} />
        <Select label="Availability" options={AVAILABILITY_OPTIONS} {...form.field("availability")} />
        <Select label="Listing status" options={STATUS_OPTIONS} {...form.field("status")} />
        <Input label="Services (comma separated)" className="form-full" {...form.field("services")} />
        <Textarea label="Description" required className="form-full" {...form.field("description")} />
      </div>
      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>{provider ? "Save changes" : "Create provider"}</Button>
      </div>
    </form>
  );
}

export default function AdminProvidersPage() {
  const req = useAsync(() => providerService.list(), []);
  const catReq = useAsync(() => serviceService.list(), []);
  const providers = useMemo(() => req.data?.items ?? [], [req.data]);
  const categories = catReq.data?.items ?? [];
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const crud = useCrudActions({ service: providerService, noun: "Provider", onChanged: req.reload });

  useEffect(() => {
    document.title = "Manage Providers — CleanNest";
  }, []);

  const ctl = useListControls(providers, {
    searchFields: [(p) => p.name, (p) => p.location, (p) => p.category],
    filters: { category: (p, v) => p.category === v, status: (p, v) => p.status === v },
    sortAccessors: { name: (p) => p.name.toLowerCase(), rating: (p) => p.rating, price: (p) => p.price, location: (p) => p.location },
    defaultSort: { key: "name", dir: "asc" },
    pageSize: 8,
  });

  const columns = [
    { key: "name", label: "Provider", sortable: true, render: (p) => (<><strong>{p.name}</strong><div className="muted small">{p.category}</div></>) },
    { key: "location", label: "Location", sortable: true },
    { key: "rating", label: "Rating", sortable: true, render: (p) => (p.reviews ? `⭐ ${p.rating} (${p.reviews})` : "New") },
    { key: "price", label: "From", sortable: true, render: (p) => formatCurrency(p.price) },
    { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} label={p.status === "active" ? "Active" : "Inactive"} /> },
    {
      key: "actions", label: "Actions", className: "col-actions",
      render: (p) => (
        <div className="row-actions">
          <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
          <Button size="sm" variant="danger-outline" onClick={() => setDeleting(p)}>Delete</Button>
        </div>
      ),
    },
  ];

  const handleSave = async (data) => {
    const res = await crud.save(editing === "new" ? null : editing.id, data);
    if (res.ok) setEditing(null);
  };

  let body;
  if (req.loading && !req.data) body = <LoadingState label="Loading providers…" />;
  else if (req.error && !req.data) body = <ErrorState error={req.error} onRetry={req.reload} title="Couldn't load providers" />;
  else
    body = (
      <>
        <FilterBar
          search={ctl.search} onSearch={ctl.setSearch} placeholder="Search name, location, category…"
          filters={[
            { key: "category", label: "All categories", value: ctl.filterValues.category, onChange: (v) => ctl.setFilter("category", v), options: categories.map((c) => c.name) },
            { key: "status", label: "All statuses", value: ctl.filterValues.status, onChange: (v) => ctl.setFilter("status", v), options: STATUS_OPTIONS },
          ]}
          hasActive={ctl.hasActiveFilters} onClear={ctl.clear} total={ctl.total} noun="provider"
        />
        {ctl.results.length === 0 ? (
          <EmptyState icon="🧰" title="No providers match" message="Try different search terms or clear the filters." action={<Button variant="outline" onClick={ctl.clear}>Clear filters</Button>} />
        ) : (
          <DataTable columns={columns} rows={ctl.results} sort={ctl.sort} onSort={ctl.toggleSort} caption="Providers" />
        )}
        <Pagination page={ctl.page} totalPages={ctl.totalPages} onPage={ctl.setPage} />
      </>
    );

  return (
    <DashboardLayout title="Service Providers" subtitle="Add, edit, hide or remove provider listings." actions={<Button onClick={() => setEditing("new")}>+ Add provider</Button>}>
      {body}
      <Modal open={!!editing} onClose={() => !crud.busy && setEditing(null)} title={editing === "new" ? "Add provider" : "Edit provider"} maxWidth={680}>
        {editing && <ProviderForm key={editing === "new" ? "new" : editing.id} provider={editing === "new" ? null : editing} categories={categories} busy={crud.busy} onCancel={() => setEditing(null)} onSubmit={handleSave} />}
      </Modal>
      <ConfirmModal
        open={!!deleting} title="Delete provider?" message={deleting ? `${deleting.name} will be removed from CleanNest. Providers with active bookings can't be deleted.` : ""}
        confirmLabel="Delete provider" loading={crud.busy} onCancel={() => setDeleting(null)}
        onConfirm={async () => { await crud.remove(deleting.id); setDeleting(null); }}
      />
    </DashboardLayout>
  );
}
