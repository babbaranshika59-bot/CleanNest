import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { Input, Textarea, FormError } from "../../components/ui/FormFields.jsx";
import Button from "../../components/ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useFormState } from "../../hooks/useFormState.js";
import { validateProfile } from "../../utils/validators.js";
import { formatDate } from "../../utils/format.js";

// Profile view + edit. Used for customers and (account section) for any signed-in role.
export default function CustomerProfilePage() {
  const { user, updateProfile } = useAuth();
  const { success, notify } = useNotifications();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const form = useFormState({ name: user.name, email: user.email, phone: user.phone || "", address: user.address || "" }, validateProfile);

  useEffect(() => {
    document.title = "My Profile — CleanNest";
  }, []);

  const startEdit = () => {
    form.reset({ name: user.name, email: user.email, phone: user.phone || "", address: user.address || "" });
    setFormError("");
    setEditing(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.validateAll()) return;
    setSaving(true);
    const res = await updateProfile(form.values);
    setSaving(false);
    if (res.ok) {
      success("Profile updated.");
      notify({ to: { userId: user.id }, type: "success", message: "Your profile was updated." });
      setEditing(false);
    } else if (/email/i.test(res.error)) {
      form.setErrors({ email: res.error });
    } else {
      setFormError(res.error);
    }
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Your contact details are pre-filled when you book a service.">
      <div className="panel profile-panel">
        {!editing ? (
          <>
            <dl className="info-grid">
              <div><dt>Full name</dt><dd>{user.name}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Phone</dt><dd>{user.phone || <span className="muted">Not added</span>}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>
              <div className="info-full"><dt>Address</dt><dd>{user.address || <span className="muted">Not added</span>}</dd></div>
            </dl>
            <Button onClick={startEdit}>Edit profile</Button>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="stack">
            <FormError>{formError}</FormError>
            <div className="form-grid">
              <Input label="Full name" required autoComplete="name" {...form.field("name")} />
              <Input label="Email" type="email" required autoComplete="email" {...form.field("email")} />
              <Input label="Phone" inputMode="tel" placeholder="10-digit mobile number" {...form.field("phone")} />
              <Textarea label="Address" className="form-full" placeholder="House no, street, area, city" {...form.field("address")} />
            </div>
            <div className="form-actions">
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
