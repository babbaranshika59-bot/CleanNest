import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { Input, Select } from "../components/ui/FormFields.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useCategories } from "../hooks/useProviderSearch.js";
import { useFormState } from "../hooks/useFormState.js";
import { Redirect, useRouter } from "../router/Router.jsx";
import { dashboardPathFor } from "../utils/constants.js";
import { isEmail } from "../utils/validators.js";

const ROLE_OPTIONS = [
  { value: "customer", label: "Book home services (Customer)" },
  { value: "provider", label: "Offer my services (Service Provider)" },
];

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = "Name is required.";
  if (!f.email.trim()) e.email = "Email is required.";
  else if (!isEmail(f.email)) e.email = "Enter a valid email.";
  if (!f.password) e.password = "Password is required.";
  else if (f.password.length < 6) e.password = "Use at least 6 characters.";
  if (f.confirm !== f.password) e.confirm = "Passwords do not match.";
  if (f.role === "provider") {
    if (!f.businessName.trim()) e.businessName = "Business name is required.";
    if (!f.category) e.category = "Select your service category.";
    if (!f.location.trim()) e.location = "Enter your service location.";
  }
  return e;
};

export default function SignupPage() {
  const { user, signup } = useAuth();
  const { navigate, query } = useRouter();
  const { success } = useNotifications();
  const { categories } = useCategories();
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const form = useFormState({ role: "customer", name: "", email: "", password: "", confirm: "", businessName: "", category: "", location: "" }, validate);
  const next = query.get("next");

  useEffect(() => {
    document.title = "Sign up — CleanNest";
  }, []);

  if (user && !submitting) return <Redirect to={dashboardPathFor(user.role)} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.validateAll()) return;
    setSubmitting(true);
    const v = form.values;
    const result = await signup({ role: v.role, name: v.name.trim(), email: v.email.trim(), password: v.password, businessName: v.businessName, category: v.category, location: v.location });
    if (result.ok) {
      success(`Welcome to CleanNest, ${result.user.name.split(" ")[0]}!`);
      const safe = next && next.startsWith("/") && !next.startsWith("//") && v.role === "customer" ? next : null;
      navigate(safe || dashboardPathFor(result.user.role), { replace: true });
    } else {
      setSubmitting(false);
      if (/email/i.test(result.error)) form.setErrors({ email: result.error });
      else setFormError(result.error);
    }
  };

  const isProvider = form.values.role === "provider";
  return (
    <AuthLayout title="Create your account" subtitle="Join CleanNest to book trusted local professionals." altTitle="Already have an account?" altText="Log in to continue managing your favorites and bookings." altTo="/login">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-error" role="alert">{formError}</div>}
        <Select label="I want to" options={ROLE_OPTIONS} {...form.field("role")} />
        <Input label="Full name" placeholder="Your full name" autoComplete="name" {...form.field("name")} />
        <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" {...form.field("email")} />
        {isProvider && (
          <>
            <Input label="Business name" placeholder="e.g. Sharma Home Care" {...form.field("businessName")} />
            <Select label="Service category" placeholder="Select a category" options={categories.map((c) => c.name)} {...form.field("category")} />
            <Input label="Service location" placeholder="City or area you serve" {...form.field("location")} />
          </>
        )}
        <Input label="Password" type="password" placeholder="At least 6 characters" autoComplete="new-password" {...form.field("password")} />
        <Input label="Confirm password" type="password" placeholder="Re-enter your password" autoComplete="new-password" {...form.field("confirm")} />
        <Button type="submit" block loading={submitting}>Create account</Button>
        <p className="auth-switch">
          Already have an account?{" "}
          <a href="#/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Log in</a>
        </p>
      </form>
    </AuthLayout>
  );
}
