import Modal from "./Modal.jsx";
import { Link } from "../router/Router.jsx";
import "../styles/ProviderDetailsModal.css";

// Props: provider (object|null), open, onClose, onBook
export default function ProviderDetailsModal({ provider, open, onClose, onBook }) {
  if (!provider) return null;

  const availabilityClass =
    provider.availability === "Available Today"
      ? "badge-success"
      : "badge-warning";

  return (
    <Modal open={open} onClose={onClose} title="Provider Details" maxWidth={640}>
      <div className="pdm">
        <div className="pdm-head">
          <div className="pdm-avatar" aria-hidden="true">
            {provider.name.charAt(0)}
          </div>
          <div>
            <h3 className="pdm-name">{provider.name}</h3>
            <span className="pdm-category">{provider.category}</span>
          </div>
        </div>

        <div className="pdm-stats">
          <div className="pdm-stat">
            <span className="pdm-stat-value">⭐ {provider.rating}</span>
            <span className="pdm-stat-label">{provider.reviews} reviews</span>
          </div>
          <div className="pdm-stat">
            <span className="pdm-stat-value">{provider.experience}</span>
            <span className="pdm-stat-label">Experience</span>
          </div>
          <div className="pdm-stat">
            <span className="pdm-stat-value">📍 {provider.location}</span>
            <span className="pdm-stat-label">Location</span>
          </div>
          <div className="pdm-stat">
            <span className={`badge ${availabilityClass}`}>{provider.availability}</span>
            <span className="pdm-stat-label">Availability</span>
          </div>
        </div>

        <div className="pdm-section">
          <h4>About</h4>
          <p className="muted">{provider.description}</p>
        </div>

        <div className="pdm-section">
          <h4>Services Offered</h4>
          <ul className="pdm-services">
            {provider.services.map((s) => (
              <li key={s} className="pdm-service">
                <span aria-hidden="true">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <p className="pdm-fullprofile">
          <Link to={`/providers/${provider.id}`} onClick={onClose}>Open full profile page →</Link>
        </p>

        <div className="pdm-footer">
          <div className="pdm-price">
            <span className="pdm-price-label">Starting at</span>
            <span className="pdm-price-value">
              ₹{provider.price}
              {provider.category === "Painting" ? "/sq.ft" : ""}
            </span>
          </div>
          <button
            className="btn btn-accent pdm-book"
            onClick={() => {
              onBook(provider);
            }}
          >
            Book This Provider
          </button>
        </div>
      </div>
    </Modal>
  );
}
