import { Link } from "../router/Router.jsx";
import "../styles/Footer.css";

const serviceLinks = [
  { label: "Cleaning", to: "/services?category=Cleaning" },
  { label: "Salon", to: "/services?category=Salon & Beauty" },
  { label: "Repair", to: "/services?category=AC & Appliance Repair" },
  { label: "Painting", to: "/services?category=Painting" },
  { label: "Plumbing", to: "/services?category=Plumbing" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Contact", to: "/about" },
];

const supportLinks = [
  { label: "Help Center", to: "/about" },
  { label: "FAQs", to: "/how-it-works" },
  { label: "Terms", to: "/about" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">CN</span>
            CleanNest
          </div>
          <p className="muted">
            Trusted local home services, right at your doorstep. Find, choose and book
            reliable professionals in just a few taps.
          </p>
          <div className="footer-social" aria-hidden="true">
            <span>🌐</span>
            <span>✉️</span>
            <span>📞</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          {serviceLinks.map((l) => (
            <Link key={l.label} to={l.to} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          {companyLinks.map((l) => (
            <Link key={l.label} to={l.to} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          {supportLinks.map((l) => (
            <Link key={l.label} to={l.to} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} CleanNest. All rights reserved.</span>
          {/* <span className="muted">Stage 1 prototype — sample data only.</span> */}
        </div>
      </div>
    </footer>
  );
}
