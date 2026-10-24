import { useEffect } from "react";
import { Link } from "../router/Router.jsx";
import { useParams } from "../router/ParamsContext.js";
import { useAsync } from "../hooks/useAsync.js";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { providerService } from "../services/providerService.js";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States.jsx";
import "../styles/Page.css";
import "../styles/ProviderDetailsModal.css";
import "../styles/ProviderPage.css";

// Dynamic route: /providers/:id
export default function ProviderDetailPage() {
  const { id } = useParams();
  const req = useAsync(() => providerService.get(id), [id]);
  const { openBooking, modals } = useBookingModals();
  const { isFavorite, toggleFavorite } = useFavorites();
  const provider = req.data;

  useEffect(() => {
    document.title = provider ? `${provider.name} — CleanNest` : "Provider — CleanNest";
  }, [provider]);

  let body;
  if (req.loading && !provider) body = <LoadingState label="Loading provider…" />;
  else if (req.error?.status === 404 || (provider && provider.status !== "active"))
    body = <EmptyState icon="🔎" title="Provider not found" message="This provider doesn't exist or is no longer listed." action={<Link to="/providers" className="btn btn-primary">Browse providers</Link>} />;
  else if (req.error) body = <ErrorState error={req.error} onRetry={req.reload} />;
  else {
    const fav = isFavorite(provider.id);
    const availabilityClass = provider.availability === "Available Today" ? "badge-success" : "badge-warning";
    body = (
      <div className="pdm provider-page-card">
        <div className="pdm-head">
          <div className="pdm-avatar" aria-hidden="true">{provider.name.charAt(0)}</div>
          <div className="provider-page-title">
            <h1 className="pdm-name">{provider.name}</h1>
            <span className="pdm-category">{provider.category}</span>
          </div>
          <button className={`favorite-btn ${fav ? "active" : ""}`} onClick={() => toggleFavorite(provider.id)} aria-pressed={fav} aria-label={fav ? "Remove from favorites" : "Add to favorites"}>{fav ? "❤" : "♡"}</button>
        </div>
        <div className="pdm-stats">
          <div className="pdm-stat"><span className="pdm-stat-value">{provider.reviews ? `⭐ ${provider.rating}` : "New"}</span><span className="pdm-stat-label">{provider.reviews} reviews</span></div>
          <div className="pdm-stat"><span className="pdm-stat-value">{provider.experience}</span><span className="pdm-stat-label">Experience</span></div>
          <div className="pdm-stat"><span className="pdm-stat-value">📍 {provider.location}</span><span className="pdm-stat-label">Location</span></div>
          <div className="pdm-stat"><span className={`badge ${availabilityClass}`}>{provider.availability}</span><span className="pdm-stat-label">Availability</span></div>
        </div>
        <div className="pdm-section"><h4>About</h4><p className="muted">{provider.description}</p></div>
        <div className="pdm-section">
          <h4>Services Offered</h4>
          {provider.services.length ? (
            <ul className="pdm-services">{provider.services.map((s) => <li key={s} className="pdm-service"><span aria-hidden="true">✓</span> {s}</li>)}</ul>
          ) : <p className="muted">This provider hasn't listed services yet.</p>}
        </div>
        <div className="pdm-footer">
          <div className="pdm-price">
            <span className="pdm-price-label">Starting at</span>
            <span className="pdm-price-value">₹{provider.price}{provider.category === "Painting" ? "/sq.ft" : ""}</span>
          </div>
          <button className="btn btn-accent pdm-book" onClick={() => openBooking(provider)}>Book This Provider</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container container-narrow">
          <Link to="/providers" className="back-link">← Back to providers</Link>
          {body}
        </div>
      </section>
      {modals}
    </div>
  );
}
