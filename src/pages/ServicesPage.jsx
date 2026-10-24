import { useEffect, useState } from "react";
import CategorySection from "../components/CategorySection.jsx";
import ProviderResults from "../components/ProviderResults.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useCategories, useProviderSearch } from "../hooks/useProviderSearch.js";
import { useRouter } from "../router/Router.jsx";
import { categories as fallbackCategories } from "../data/sampleData.js";
import "../styles/Page.css";

export default function ServicesPage() {
  const { query, navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(query.get("category") || "");
  const [search, setSearch] = useState(query.get("q") || "");
  const [location, setLocation] = useState(query.get("loc") || "");
  const [page, setPage] = useState(1);
  const { openBooking, openDetails, modals } = useBookingModals();
  const { categories, loading: catsLoading } = useCategories();

  const dSearch = useDebouncedValue(search, 300);
  const dLocation = useDebouncedValue(location, 300);
  const req = useProviderSearch({ q: dSearch, location: dLocation, category: selectedCategory, page });

  useEffect(() => {
    document.title = selectedCategory ? `${selectedCategory} — CleanNest Services` : "Services — CleanNest";
  }, [selectedCategory]);

  const handleCategorySelect = (name) => {
    setSelectedCategory((prev) => (prev === name ? "" : name));
    setPage(1);
  };
  const clearFilters = () => {
    setSelectedCategory("");
    setSearch("");
    setLocation("");
    setPage(1);
    navigate("/services");
  };
  const total = req.data?.total;

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>Explore trusted local services</h1>
          <p className="muted">Browse by category or search by name, service type, and location.</p>
          <SearchBar query={search} onQueryChange={(v) => { setSearch(v); setPage(1); }} location={location} onLocationChange={(v) => { setLocation(v); setPage(1); }} onSubmit={() => {}} placeholder="Search providers or services" />
        </div>
      </section>

      <CategorySection categories={catsLoading && !categories.length ? fallbackCategories : categories} selectedCategory={selectedCategory} onSelect={handleCategorySelect} title="Pick a service category" subtitle="Select a category to filter providers below." />

      <section className="section">
        <div className="container">
          <div className="results-bar">
            <span className="results-count" aria-live="polite">
              {total === undefined ? "Searching…" : `${total} provider${total === 1 ? "" : "s"} found${selectedCategory ? ` in ${selectedCategory}` : ""}`}
            </span>
            {(selectedCategory || search || location) && <button className="btn btn-ghost" onClick={clearFilters}>Clear Filters</button>}
          </div>
          <ProviderResults req={req} page={page} onPage={setPage} onBook={openBooking} onView={openDetails} onClearFilters={clearFilters} />
        </div>
      </section>
      {modals}
    </div>
  );
}
