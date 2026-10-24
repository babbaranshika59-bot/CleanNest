import { useEffect, useState } from "react";
import ProviderResults from "../components/ProviderResults.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useCategories, useProviderSearch } from "../hooks/useProviderSearch.js";
import { useRouter } from "../router/Router.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import "../styles/Page.css";

const SORTS = [
  { value: "", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "name", label: "Name (A–Z)" },
];

export default function ProvidersPage() {
  const { query, navigate } = useRouter();
  const { favorites } = useFavorites();
  const onlyFavorites = query.get("favorites") === "1";

  // URL query params (?q= &loc= &category= &favorites=1) still seed the filters, as before.
  const [search, setSearch] = useState(query.get("q") || "");
  const [location, setLocation] = useState(query.get("loc") || "");
  const [selectedCategory, setSelectedCategory] = useState(query.get("category") || "");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const { openBooking, openDetails, modals } = useBookingModals();
  const { categories } = useCategories();

  // Debounce typing so we don't hit the service on every keystroke.
  const dSearch = useDebouncedValue(search, 300);
  const dLocation = useDebouncedValue(location, 300);

  const req = useProviderSearch({ q: dSearch, location: dLocation, category: selectedCategory, sort, page, onlyIds: onlyFavorites ? favorites : null });

  useEffect(() => {
    document.title = onlyFavorites ? "Your Favorites — CleanNest" : "Providers — CleanNest";
  }, [onlyFavorites]);

  const resetPage = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearch("");
    setLocation("");
    setSort("");
    setPage(1);
    navigate("/providers");
  };

  const total = req.data?.total;
  const hasFilters = selectedCategory || search || location || onlyFavorites || sort;

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{onlyFavorites ? "Saved" : "Browse"}</span>
          <h1>{onlyFavorites ? "Your favorite providers" : "All local professionals"}</h1>
          <p className="muted">{onlyFavorites ? "Providers you've saved for later." : "Search and compare trusted local service providers."}</p>
          <SearchBar query={search} onQueryChange={resetPage(setSearch)} location={location} onLocationChange={resetPage(setLocation)} onSubmit={() => {}} placeholder="Search by name, service or location" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-chips">
            <button className={`chip ${!selectedCategory ? "active" : ""}`} onClick={() => resetPage(setSelectedCategory)("")}>All</button>
            {categories.map((c) => (
              <button key={c.id} className={`chip ${selectedCategory === c.name ? "active" : ""}`} onClick={() => resetPage(setSelectedCategory)(selectedCategory === c.name ? "" : c.name)}>
                <span aria-hidden="true">{c.icon}</span> {c.name}
              </button>
            ))}
            {onlyFavorites && (
              <button className="chip chip-accent" onClick={() => navigate("/providers")}>★ Show all</button>
            )}
          </div>

          <div className="results-bar">
            <span className="results-count" aria-live="polite">
              {total === undefined ? "Searching…" : `${total} provider${total === 1 ? "" : "s"} found`}
            </span>
            <div className="results-controls">
              <select className="select select-sm" value={sort} onChange={(e) => resetPage(setSort)(e.target.value)} aria-label="Sort providers">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {hasFilters && <button className="btn btn-ghost" onClick={clearFilters}>Clear Filters</button>}
            </div>
          </div>

          <ProviderResults req={req} page={page} onPage={setPage} onBook={openBooking} onView={openDetails} onClearFilters={clearFilters} />
        </div>
      </section>
      {modals}
    </div>
  );
}
