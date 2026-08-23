import { Link } from "../router/Router.jsx";
import "../styles/Auth.css";

// Shared layout for the login + signup pages.
export default function AuthLayout({ title, subtitle, children, altTitle, altText, altTo }) {
  return (
    <section className="auth">
      <div className="auth-card">
        <div className="auth-form-side">
          <span className="eyebrow">CleanNest</span>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>

        <aside className="auth-aside">
          <div className="auth-aside-inner">
            <h2>{altTitle}</h2>
            <p>{altText}</p>
            <Link to={altTo} className="btn btn-outline btn-block">
              {altTo === "/signup" ? "Create an account" : "Back to log in"}
            </Link>
            <ul className="auth-points">
              <li><span aria-hidden="true">✓</span> Browse trusted local professionals</li>
              <li><span aria-hidden="true">✓</span> Save your favorite providers</li>
              <li><span aria-hidden="true">✓</span> Book services in a few taps</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
