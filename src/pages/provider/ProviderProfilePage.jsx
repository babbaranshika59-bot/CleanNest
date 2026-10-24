import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import { Input, Select, Textarea } from "../../components/ui/FormFields.jsx";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useFormState } from "../../hooks/useFormState.js";
import { providerService } from "../../services/providerService.js";
import { serviceService } from "../../services/serviceService.js";
import { AVAILABILITY_OPTIONS } from "../../utils/constants.js";
import { validateProviderBusiness, validateServiceName } from "../../utils/validators.js";

const TABS = [
  { key: "business", label: "Business profile" },
  { key: "services", label: "Services" },
  { key: "availability", label: "Availability" },
];

function ProfileEditor({ provider, categories, onSaved }) {
  const { success, error: toastError, notify } = useNotifications();
  const { user } = useAuth();
  const [tab, setTab] = useState("business");
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState("");
  const [serviceError, setServiceError] = useState("");
  const form = useFormState(
    { name: provider.name, category: provider.category, location: provider.location, price: provider.price, experience: provider.experience, phone: provider.phone || "", description: provider.description },
    validateProviderBusiness
  );
  const [availability, setAvailability] = useState(provider.availability);

  // Every save goes through providerService; toasts/notifications only fire on success.
  const persist = async (patch, message) => {
    setSaving(true);
    try {
      const updated = await providerService.update(provider.id, patch);
      success(message);
      notify({ to: { userId: user.id }, type: "success", message });
      onSaved(updated);
      return true;
    } catch (err) {
      toastError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveBusiness = async (e) => {
    e.preventDefault();
    if (!form.validateAll()) return;
    await persist({ ...form.values, price: Number(form.values.price) }, "Business profile updated.");
  };

  const addService = async (e) => {
    e.preventDefault();
    const msg = validateServiceName(newService, provider.services);
    setServiceError(msg);
    if (msg) return;
    if (await persist({ services: [...provider.services, newService.trim()] }, `Service "${newService.trim()}" added.`)) setNewService("");
  };

  return (
    <div className="panel">
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Provider profile sections" />

      {tab === "business" && (
        <form onSubmit={saveBusiness} noValidate className="stack">
          <div className="form-grid">
            <Input label="Business name" required {...form.field("name")} />
            <Select label="Category" required placeholder="Select category" options={categories.map((c) => c.name)} {...form.field("category")} />
            <Input label="Location" required {...form.field("location")} />
            <Input label="Starting price (₹)" required type="number" min="1" {...form.field("price")} />
            <Input label="Experience" required placeholder="e.g. 5 years" {...form.field("experience")} />
            <Input label="Business phone" inputMode="tel" {...form.field("phone")} />
            <Textarea label="About your business" required className="form-full" {...form.field("description")} />
          </div>
          <div className="form-actions"><Button type="submit" loading={saving}>Save profile</Button></div>
        </form>
      )}

      {tab === "services" && (
        <div className="stack">
          <p className="muted">Customers choose from these when booking you.</p>
          {provider.services.length === 0 ? (
            <EmptyState icon="🛠️" title="No services listed" message="Add at least one service so customers can book you." />
          ) : (
            <ul className="service-list">
              {provider.services.map((s) => (
                <li key={s}>
                  <span>{s}</span>
                  <Button size="sm" variant="danger-outline" disabled={saving} onClick={() => persist({ services: provider.services.filter((x) => x !== s) }, `Service "${s}" removed.`)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addService} noValidate className="inline-form">
            <Input label="Add a service" value={newService} error={serviceError} onChange={(e) => { setNewService(e.target.value); setServiceError(""); }} placeholder="e.g. Balcony Cleaning" />
            <Button type="submit" loading={saving}>Add</Button>
          </form>
        </div>
      )}

      {tab === "availability" && (
        <div className="stack">
          <p className="muted">Choose when customers can expect you. Setting "Unavailable" blocks new bookings.</p>
          <Select label="Availability" options={AVAILABILITY_OPTIONS} value={availability} onChange={(e) => setAvailability(e.target.value)} />
          <div className="form-actions">
            <Button loading={saving} disabled={availability === provider.availability} onClick={() => persist({ availability }, "Availability updated.")}>Save availability</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const providerReq = useAsync(() => (user.providerId ? providerService.get(user.providerId) : Promise.resolve(null)), [user.providerId]);
  const catReq = useAsync(() => serviceService.list(), []);
  const [override, setOverride] = useState(null);

  useEffect(() => {
    document.title = "Profile & Services — CleanNest";
  }, []);

  const provider = override || providerReq.data;
  let body;
  if (providerReq.loading || catReq.loading) body = <LoadingState label="Loading profile…" />;
  else if (providerReq.error || catReq.error) body = <ErrorState error={providerReq.error || catReq.error} onRetry={() => { providerReq.reload(); catReq.reload(); }} />;
  else if (!provider) body = <EmptyState icon="🧰" title="No provider profile linked" message="An admin needs to link a provider profile to your account." />;
  else body = <ProfileEditor key={provider.id} provider={provider} categories={catReq.data.items} onSaved={setOverride} />;

  return (
    <DashboardLayout title="Profile & Services" subtitle="Keep your business details, services and availability current.">
      {body}
    </DashboardLayout>
  );
}
