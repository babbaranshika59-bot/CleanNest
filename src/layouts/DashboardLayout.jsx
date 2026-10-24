import { Link, useRouter } from "../router/Router.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { DASHBOARD_NAV } from "../config/navigation.js";
import { ROLE_LABELS } from "../utils/constants.js";
import "../styles/Dashboard.css";

// Shared shell for all role dashboards: sidebar (becomes a scrollable tab strip on mobile) + content.
export default function DashboardLayout({ title, subtitle, actions, children }) {
  const { user } = useAuth();
  const { pathname } = useRouter();
  const nav = DASHBOARD_NAV[user?.role] || [];
  const isActive = (item) => (item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`));

  return (
    <div className="dash">
      <aside className="dash-side" aria-label="Dashboard navigation">
        <div className="dash-user">
          <div className="dash-avatar" aria-hidden="true">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="dash-user-text">
            <strong>{user?.name}</strong>
            <span className="dash-role">{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>
        <nav className="dash-nav">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={`dash-link ${isActive(item) ? "active" : ""}`} aria-current={isActive(item) ? "page" : undefined}>
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className="dash-main">
        <header className="dash-head">
          <div>
            <h1 className="dash-title">{title}</h1>
            {subtitle && <p className="muted dash-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="dash-actions">{actions}</div>}
        </header>
        {children}
      </section>
    </div>
  );
}
