import { useFavorites } from "../context/FavoritesContext.jsx";
import "../styles/ServiceProviderCard.css";

// Props: provider, onBook, onView
export default function ServiceProviderCard({ provider, onBook, onView }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(provider.id);

  const availabilityClass =
    provider.availability === "Available Today"
      ? "badge-success"
      : "badge-warning";

  return (
    <article className="provider-card">
      <div className="provider-card-top">
        <div className="provider-card-avatar" aria-hidden="true">
          {provider.name.charAt(0)}
        </div>
        <div className="provider-card-id">
          <h3 className="provider-card-name">{provider.name}</h3>
          <span className="provider-card-category">{provider.category}</span>
        </div>
        <button
          className={`favorite-btn ${fav ? "active" : ""}`}
          onClick={() => toggleFavorite(provider.id)}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          {fav ? "❤" : "♡"}
        </button>
      </div>

      <div className="provider-card-stats">
        <span className="provider-stat">⭐ {provider.rating}</span>
        <span className="provider-stat">({provider.reviews} reviews)</span>
        <span className="provider-stat">🕒 {provider.experience}</span>
      </div>

      <p className="provider-card-desc">{provider.description}</p>

      <div className="provider-card-info">
        <span className="provider-info-item">📍 {provider.location}</span>
        <span className={`badge ${availabilityClass}`}>{provider.availability}</span>
      </div>

      <div className="provider-card-footer">
        <div className="provider-price">
          <span className="provider-price-label">Starting at</span>
          <span className="provider-price-value">
            ₹{provider.price}
            {provider.category === "Painting" ? "/sq.ft" : ""}
          </span>
        </div>
        <div className="provider-card-actions">
          <button className="btn btn-outline" onClick={() => onView(provider)}>
            View Details
          </button>
          <button className="btn btn-primary" onClick={() => onBook(provider)}>
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}
