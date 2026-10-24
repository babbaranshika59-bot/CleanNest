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
import { useAuth } from "../../context/AuthContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useCrudActions } from "../../hooks/useCrudActions.js";
import { useFormState } from "../../hooks/useFormState.js";
import { useListControls } from "../../hooks/useListControls.js";
import { userService } from "../../services/userService.js";
import { providerService } from "../../services/providerService.js";
import { ROLE_LABELS } from "../../utils/constants.js";
import { validateUserForm } from "../../utils/validators.js";
import { formatDate } from "../../utils/format.js";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [{ value: "active", label: "Active" }, { value: "blocked", label: "Blocked" }];

function UserForm({ user, providers, onCancel, onSubmit, busy }) {
  const isNew = !user;
  const form = useFormState(
    user ? { ...user, password: "", providerId: user.providerId ?? "" } : { name: "", email: "", phone: "", address: "", role: "customer", status: "active", password: "", providerId: "" },
    (v) => validateUserForm(v, { isNew })
  );
  const submit = (e) => {
    e.preventDefault();
    if (!form.validateAll()) return;
    const { passwordHash, ...v } = form.values;
    void passwordHash;
    const data = { ...v, providerId: v.role === "provider" && v.providerId !== "" ? Number(v.providerId) : null };
    if (!data.password) delete data.password;
    onSubmit(data, form);
  };
  return (
    <form onSubmit={submit} noValidate className="stack">
      <div className="form-grid">
        <Input label="Full name" required {...form.field("name")} />
        <Input label="Email" type="email" required {...form.field("email")} />
        <Input label="Phone" inputMode="tel" {...form.field("phone")} />
        <Input label={isNew ? "Password" : "New password"} type="password" required={isNew} hint={isNew ? "Min 6 characters" : "Leave blank to keep current"} autoComplete="new-password" {...form.field("password")} />
        <Select label="Role" required options={ROLE_OPTIONS} {...form.field("role")} />
        <Select label="Status" required options={STATUS_OPTIONS} {...form.field("status")} />
        {form.values.role === "provider" && (
          <Select label="Linked provider profile" className="form-full" placeholder="— none —" options={providers.map((p) => ({ value: p.id, label: p.name }))} {...form.field("providerId")} />
        )}
        <Textarea label="Address" className="form-full" {...form.field("address")} />
      </div>
      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>{isNew ? "Create user" : "Save changes"}</Button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const { user: me, setUser } = useAuth();
  const req = useAsync(() => userService.list(), []);
  const provReq = useAsync(() => providerService.list(), []);
  const users = useMemo(() => req.data?.items ?? [], [req.data]);
  const [editing, setEditing] = useState(null); // null | "new" | user
  const [deleting, setDeleting] = useState(null);
  const crud = useCrudActions({ service: userService, noun: "User", onChanged: req.reload });

  useEffect(() => {
    document.title = "Manage Users — CleanNest";
  }, []);

  const ctl = useListControls(users, {
    searchFields: [(u) => u.name, (u) => u.email, (u) => u.phone],
    filters: { role: (u, v) => u.role === v, status: (u, v) => u.status === v },
    sortAccessors: { name: (u) => u.name.toLowerCase(), role: (u) => u.role, createdAt: (u) => u.createdAt },
    defaultSort: { key: "name", dir: "asc" },
    pageSize: 8,
  });

  const columns = [
    { key: "name", label: "Name", sortable: true, render: (u) => (<><strong>{u.name}</strong><div className="muted small">{u.email}</div></>) },
    { key: "role", label: "Role", sortable: true, render: (u) => <span className="badge badge-neutral">{ROLE_LABELS[u.role]}</span> },
    { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "createdAt", label: "Joined", sortable: true, render: (u) => formatDate(u.createdAt) },
    {
      key: "actions", label: "Actions", className: "col-actions",
      render: (u) => (
        <div className="row-actions">
          <Button size="sm" variant="outline" onClick={() => setEditing(u)}>Edit</Button>
          <Button size="sm" variant="danger-outline" disabled={u.id === me.id} title={u.id === me.id ? "You can't delete your own account" : undefined} onClick={() => setDeleting(u)}>Delete</Button>
        </div>
      ),
    },
  ];

  const handleSave = async (data, form) => {
    const res = await crud.save(editing === "new" ? null : editing.id, data);
    if (res.ok) {
      if (editing !== "new" && editing.id === me.id) setUser(res.data);
      setEditing(null);
    } else if (/email/i.test(res.error)) form.setErrors({ email: res.error });
  };

  let body;
  if (req.loading && !req.data) body = <LoadingState label="Loading users…" />;
  else if (req.error && !req.data) body = <ErrorState error={req.error} onRetry={req.reload} title="Couldn't load users" />;
  else
    body = (
      <>
        <FilterBar
          search={ctl.search} onSearch={ctl.setSearch} placeholder="Search name, email, phone…"
          filters={[
            { key: "role", label: "All roles", value: ctl.filterValues.role, onChange: (v) => ctl.setFilter("role", v), options: ROLE_OPTIONS },
            { key: "status", label: "All statuses", value: ctl.filterValues.status, onChange: (v) => ctl.setFilter("status", v), options: STATUS_OPTIONS },
          ]}
          hasActive={ctl.hasActiveFilters} onClear={ctl.clear} total={ctl.total} noun="user"
        />
        {ctl.results.length === 0 ? (
          <EmptyState icon="👥" title="No users match" message="Try different search terms or clear the filters." action={<Button variant="outline" onClick={ctl.clear}>Clear filters</Button>} />
        ) : (
          <DataTable columns={columns} rows={ctl.results} sort={ctl.sort} onSort={ctl.toggleSort} caption="Users" />
        )}
        <Pagination page={ctl.page} totalPages={ctl.totalPages} onPage={ctl.setPage} />
      </>
    );

  return (
    <DashboardLayout title="Users" subtitle="Create, edit, block or remove accounts." actions={<Button onClick={() => setEditing("new")}>+ Add user</Button>}>
      {body}
      <Modal open={!!editing} onClose={() => !crud.busy && setEditing(null)} title={editing === "new" ? "Add user" : "Edit user"} maxWidth={620}>
        {editing && <UserForm key={editing === "new" ? "new" : editing.id} user={editing === "new" ? null : editing} providers={provReq.data?.items ?? []} busy={crud.busy} onCancel={() => setEditing(null)} onSubmit={handleSave} />}
      </Modal>
      <ConfirmModal
        open={!!deleting} title="Delete user?" message={deleting ? `${deleting.name} (${deleting.email}) will be permanently removed.` : ""}
        confirmLabel="Delete user" loading={crud.busy} onCancel={() => setDeleting(null)}
        onConfirm={async () => { const res = await crud.remove(deleting.id); if (res.ok) setDeleting(null); else setDeleting(null); }}
      />
    </DashboardLayout>
  );
}
