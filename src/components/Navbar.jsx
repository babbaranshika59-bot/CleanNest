import { useEffect, useState } from "react";
import { Link, useRouter } from "../router/Router.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./ui/NotificationBell.jsx";
import { ROLE_LABELS, dashboardPathFor } from "../utils/constants.js";
import "../styles/Navbar.css";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Providers", to: "/providers" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const { pathname, navigate } = useRouter();
  const { count } = useFavorites();
  const { user, logout } = useAuth();
  // The mobile menu is "open for a specific path", so it closes automatically on navigation.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;
  const setOpen = (v) => setMenu({ open: typeof v === "function" ? v(open) : v, path: pathname });
  const [scrolled, setScrolled] = useState(false);

  // Add a solid background to the navbar after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const handleNav = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <span className="navbar-logo-mark" aria-hidden="true">CN</span>
          <span className="navbar-logo-text">CleanNest</span>
        </Link>

        <nav className={`navbar-links ${open ? "open" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`navbar-link ${isActive(item.to) ? "active" : ""}`}
              onClick={() => handleNav(item.to)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/providers"
            className="navbar-fav"
            onClick={() => handleNav("/providers?favorites=1")}
            title="View your favorite providers"
          >
            <span aria-hidden="true">❤</span> Favorites
            {count > 0 && <span className="navbar-fav-count">{count}</span>}
          </Link>

          {user ? (
            <div className="navbar-auth">
              <NotificationBell />
              <span className="navbar-user" title={ROLE_LABELS[user.role]}>Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-outline navbar-btn" onClick={() => handleNav(dashboardPathFor(user.role))}>
                Dashboard
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>
                Log in
              </button>
              <button className="btn btn-primary navbar-btn" onClick={() => navigate("/signup")}>
                Sign up
              </button>
            </div>
          )}
        </nav>

        <button
          className="navbar-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`navbar-toggle-bar ${open ? "open" : ""}`} />
          <span className={`navbar-toggle-bar ${open ? "open" : ""}`} />
          <span className={`navbar-toggle-bar ${open ? "open" : ""}`} />
        </button>
      </div>
    </header>
  );
}
