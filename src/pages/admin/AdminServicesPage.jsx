import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FilterBar from "../../components/ui/FilterBar.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { Input, Textarea } from "../../components/ui/FormFields.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useCrudActions } from "../../hooks/useCrudActions.js";
import { useFormState } from "../../hooks/useFormState.js";
import { useListControls } from "../../hooks/useListControls.js";
import { serviceService } from "../../services/serviceService.js";
import { validateCategoryForm } from "../../utils/validators.js";

function CategoryForm({ category, busy, onCancel, onSubmit }) {
  const form = useFormState(category ? { ...category } : { name: "", icon: "🏠", description: "" }, validateCategoryForm);
  const submit = (e) => {
    e.preventDefault();
    if (form.validateAll()) onSubmit(form.values, form);
  };
  return (
    <form onSubmit={submit} noValidate className="stack">
      <Input label="Category name" required {...form.field("name")} />
      <Input label="Icon (emoji)" required maxLength={4} {...form.field("icon")} />
      <Textarea label="Description" required {...form.field("description")} />
      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>{category ? "Save changes" : "Create category"}</Button>
      </div>
    </form>
  );
}

export default function AdminServicesPage() {
  const req = useAsync(() => serviceService.list(), []);
  const cats = useMemo(() => req.data?.items ?? [], [req.data]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const crud = useCrudActions({ service: serviceService, noun: "Category", onChanged: req.reload });

  useEffect(() => {
    document.title = "Manage Services — CleanNest";
  }, []);

  const ctl = useListControls(cats, {
    searchFields: [(c) => c.name, (c) => c.description],
    sortAccessors: { name: (c) => c.name.toLowerCase(), providersCount: (c) => c.providersCount },
    defaultSort: { key: "name", dir: "asc" },
    pageSize: 20,
  });

  const columns = [
    { key: "icon", label: "", render: (c) => <span className="cat-icon" aria-hidden="true">{c.icon}</span> },
    { key: "name", label: "Category", sortable: true, render: (c) => <strong>{c.name}</strong> },
    { key: "description", label: "Description", className: "col-wide" },
    { key: "providersCount", label: "Active providers", sortable: true },
    {
      key: "actions", label: "Actions", className: "col-actions",
      render: (c) => (
        <div className="row-actions">
          <Button size="sm" variant="outline" onClick={() => setEditing(c)}>Edit</Button>
          <Button size="sm" variant="danger-outline" onClick={() => setDeleting(c)}>Delete</Button>
        </div>
      ),
    },
  ];

  const handleSave = async (data, form) => {
    const res = await crud.save(editing === "new" ? null : editing.id, data);
    if (res.ok) setEditing(null);
    else if (/name|exists/i.test(res.error)) form.setErrors({ name: res.error });
  };

  let body;
  if (req.loading && !req.data) body = <LoadingState label="Loading services…" />;
  else if (req.error && !req.data) body = <ErrorState error={req.error} onRetry={req.reload} title="Couldn't load services" />;
  else
    body = (
      <>
        <FilterBar search={ctl.search} onSearch={ctl.setSearch} placeholder="Search categories…" hasActive={ctl.hasActiveFilters} onClear={ctl.clear} total={ctl.total} noun="category" />
        {ctl.results.length === 0 ? (
          <EmptyState icon="🏷️" title="No categories found" message="Add a category or change your search." action={<Button onClick={() => setEditing("new")}>+ Add category</Button>} />
        ) : (
          <DataTable columns={columns} rows={ctl.results} sort={ctl.sort} onSort={ctl.toggleSort} caption="Service categories" />
        )}
      </>
    );

  return (
    <DashboardLayout title="Services & Categories" subtitle="Categories customers browse on the Services page." actions={<Button onClick={() => setEditing("new")}>+ Add category</Button>}>
      {body}
      <Modal open={!!editing} onClose={() => !crud.busy && setEditing(null)} title={editing === "new" ? "Add category" : "Edit category"} maxWidth={500}>
        {editing && <CategoryForm key={editing === "new" ? "new" : editing.id} category={editing === "new" ? null : editing} busy={crud.busy} onCancel={() => setEditing(null)} onSubmit={handleSave} />}
      </Modal>
      <ConfirmModal
        open={!!deleting} title="Delete category?" message={deleting ? `"${deleting.name}" will be removed. Categories still used by providers can't be deleted.` : ""}
        confirmLabel="Delete category" loading={crud.busy} onCancel={() => setDeleting(null)}
        onConfirm={async () => { await crud.remove(deleting.id); setDeleting(null); }}
      />
    </DashboardLayout>
  );
}
