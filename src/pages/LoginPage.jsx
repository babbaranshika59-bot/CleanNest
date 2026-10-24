import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/FormFields.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Redirect, useRouter } from "../router/Router.jsx";
import { DEMO_ACCOUNTS } from "../services/seedData.js";
import { dashboardPathFor } from "../utils/constants.js";
import { isEmail } from "../utils/validators.js";

// Only allow in-app paths as post-login targets.
const safeNext = (next) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

export default function LoginPage() {
  const { user, login } = useAuth();
  const { navigate, query } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const next = safeNext(query.get("next"));

  useEffect(() => {
    document.title = "Log in — CleanNest";
  }, []);

  if (user && !submitting) return <Redirect to={next || dashboardPathFor(user.role)} />;

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!isEmail(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    const result = await login({ email: email.trim(), password });
    if (result.ok) navigate(next || dashboardPathFor(result.user.role), { replace: true });
    else {
      setSubmitting(false);
      setFormError(result.error);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your favorites and bookings." altTitle="New to CleanNest?" altText="Create an account to save providers and book services faster." altTo="/signup">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-error" role="alert">{formError}</div>}
        <Input label="Email address" type="email" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" value={password} error={errors.password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} placeholder="Your password" autoComplete="current-password" />
        <Button type="submit" block loading={submitting}>Log in</Button>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <p className="muted small">Click one to fill the form (demo data only — passwords are not stored in plain text).</p>
          <div className="demo-list">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} type="button" className="demo-chip" onClick={() => { setEmail(a.email); setPassword(a.password); setErrors({}); setFormError(""); }}>
                {a.role}
              </button>
            ))}
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a href="#/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign up</a>
        </p>
      </form>
    </AuthLayout>
  );
}
