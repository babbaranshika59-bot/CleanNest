import { useEffect, useState } from "react";
import CategorySection from "../components/CategorySection.jsx";
import ProviderList from "../components/ProviderList.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { useRouter } from "../router/Router.jsx";
import { categories, providers } from "../data/sampleData.js";
import "../styles/Page.css";


export default function ServicesPage() {
  const { query, navigate } = useRouter();
  const initialCategory = query.get("category") || "";
  const initialSearch = query.get("q") || "";
  const initialLocation = query.get("loc") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const { openBooking, openDetails, modals } = useBookingModals();

  // DOM interaction: update document title based on selected category (useEffect)
  useEffect(() => {
    document.title = selectedCategory
      ? `${selectedCategory} — CleanNest Services`
      : "Services — CleanNest";
  }, [selectedCategory]);

  const handleCategorySelect = (name) => {
    setSelectedCategory((prev) => (prev === name ? "" : name));
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearch("");
    setLocation("");
    navigate("/services");
  };

  const filtered = providers.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);
    const l = location.trim().toLowerCase();
    const matchesLocation = !l || p.location.toLowerCase().includes(l);
    return matchesCategory && matchesSearch && matchesLocation;
  });

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>Explore trusted local services</h1>
          <p className="muted">
            Browse by category or search by name, service type, and location.
          </p>
          <SearchBar
            query={search}
            onQueryChange={setSearch}
            location={location}
            onLocationChange={setLocation}
            onSubmit={() => {}}
            placeholder="Search providers or services"
          />
        </div>
      </section>

      <CategorySection
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
        title="Pick a service category"
        subtitle="Select a category to filter providers below."
      />

      <section className="section">
        <div className="container">
          <div className="results-bar">
            <span className="results-count">
              {filtered.length} provider{filtered.length === 1 ? "" : "s"} found
              {selectedCategory && ` in ${selectedCategory}`}
            </span>
            {(selectedCategory || search || location) && (
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
