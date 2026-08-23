import ServiceProviderCard from "./ServiceProviderCard.jsx";
import "../styles/ProviderList.css";

// Props: providers (array), onBook, onView, emptyAction
export default function ProviderList({ providers, onBook, onView, onClearFilters }) {
  if (providers.length === 0) {
    return (
      <div className="provider-empty">
        <div className="provider-empty-icon" aria-hidden="true">🔍</div>
        <h3>No providers found</h3>
        <p className="muted">Try a different search term, location, or category.</p>
        <button className="btn btn-primary" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="provider-grid">
      {providers.map((provider) => (
        <ServiceProviderCard
          key={provider.id}
          provider={provider}
          onBook={onBook}
          onView={onView}
        />
      ))}
    </div>
  );
}
