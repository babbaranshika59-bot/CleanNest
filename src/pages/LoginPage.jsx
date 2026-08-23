import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useRouter } from "../router/Router.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.title = "Log in — CleanNest";
  }, []);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    const result = login({ email, password });
    if (result.ok) {
      navigate("/");
    } else {
      setFormError("Could not log in. Please check your details.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your favorites and bookings."
      altTitle="New to CleanNest?"
      altText="Create an account to save providers and book services faster."
      altTo="/signup"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-error">{formError}</div>}

        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Your password"
            autoComplete="current-password"
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Log in
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a
            href="#/signup"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
          >
            Sign up
          </a>
        </p>

        
      </form>
    </AuthLayout>
  );
}
