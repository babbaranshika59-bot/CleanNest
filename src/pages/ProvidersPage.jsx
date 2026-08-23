import { useEffect, useMemo, useState } from "react";
import ProviderList from "../components/ProviderList.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { useRouter } from "../router/Router.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { categories, providers } from "../data/sampleData.js";
import "../styles/Page.css";

export default function ProvidersPage() {
  const { query, navigate } = useRouter();
  const { favorites, isFavorite } = useFavorites();
  const onlyFavorites = query.get("favorites") === "1";

  const [search, setSearch] = useState(query.get("q") || "");
  const [location, setLocation] = useState(query.get("loc") || "");
  const [selectedCategory, setSelectedCategory] = useState(query.get("category") || "");
  const { openBooking, openDetails, modals } = useBookingModals();

  // DOM interaction: dynamic document title reflecting current filter view
  useEffect(() => {
    document.title = onlyFavorites
      ? "Your Favorites — CleanNest"
      : "Providers — CleanNest";
  }, [onlyFavorites]);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (onlyFavorites && !isFavorite(p.id)) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      const q = search.trim().toLowerCase();
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q)
      )
        return false;
      const l = location.trim().toLowerCase();
      if (l && !p.location.toLowerCase().includes(l)) return false;
      return true;
    });
  }, [onlyFavorites, selectedCategory, search, location, favorites]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSearch("");
    setLocation("");
    navigate("/providers");
  };

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{onlyFavorites ? "Saved" : "Browse"}</span>
          <h1>{onlyFavorites ? "Your favorite providers" : "All local professionals"}</h1>
          <p className="muted">
            {onlyFavorites
              ? "Providers you've saved for later."
              : "Search and compare trusted local service providers."}
          </p>
          <SearchBar
            query={search}
            onQueryChange={setSearch}
            location={location}
            onLocationChange={setLocation}
            onSubmit={() => {}}
            placeholder="Search by name, service or location"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-chips">
            <button
              className={`chip ${!selectedCategory ? "active" : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`chip ${selectedCategory === c.name ? "active" : ""}`}
                onClick={() =>
                  setSelectedCategory((prev) => (prev === c.name ? "" : c.name))
                }
              >
                <span aria-hidden="true">{c.icon}</span> {c.name}
              </button>
            ))}
            {onlyFavorites && (
              <button
                className="chip chip-accent"
                onClick={() => navigate("/providers")}
              >
                ★ Show all
              </button>
            )}
          </div>

          <div className="results-bar">
            <span className="results-count">
              {filtered.length} provider{filtered.length === 1 ? "" : "s"} found
            </span>
            {(selectedCategory || search || location || onlyFavorites) && (
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <ProviderList
            providers={filtered}
            onBook={openBooking}
            onView={openDetails}
            onClearFilters={clearFilters}
          />
        </div>
      </section>

      {modals}
    </div>
  );
}
