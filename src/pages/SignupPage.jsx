import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useRouter } from "../router/Router.jsx";

export default function SignupPage() {
  const { signup } = useAuth();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.title = "Sign up — CleanNest";
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    const result = signup({ name: form.name, email: form.email, password: form.password });
    if (result.ok) {
      navigate("/");
    } else {
      setFormError("Could not create your account. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CleanNest to book trusted local professionals."
      altTitle="Already have an account?"
      altText="Log in to continue managing your favorites and bookings."
      altTo="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-error">{formError}</div>}

        <div className="field">
          <label htmlFor="su-name">Full name</label>
          <input
            id="su-name"
            className="input"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Your full name"
            autoComplete="name"
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="field">
          <label htmlFor="su-email">Email address</label>
          <input
            id="su-email"
            className="input"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="field">
          <label htmlFor="su-password">Password</label>
          <input
            id="su-password"
            className="input"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
        </div>

        <div className="field">
          <label htmlFor="su-confirm">Confirm password</label>
          <input
            id="su-confirm"
            className="input"
            type="password"
            value={form.confirm}
            onChange={handleChange("confirm")}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Create account
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <a
            href="#/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Log in
          </a>
        </p>

        
      </form>
    </AuthLayout>
  );
}
