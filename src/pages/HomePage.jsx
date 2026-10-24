import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import CategorySection from "../components/CategorySection.jsx";
import { HowItWorks, WhyChoose, Stats, CtaBanner } from "../components/InfoSections.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import ProviderResults from "../components/ProviderResults.jsx";
import { useCategories, useProviderSearch } from "../hooks/useProviderSearch.js";
import { categories as fallbackCategories, stats, benefits, steps } from "../data/sampleData.js";
import "../styles/Page.css";
import { useRouter } from "../router/Router.jsx";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { openBooking, openDetails, modals } = useBookingModals();
  const { navigate } = useRouter();

  // DOM interaction: update document title for the Home page
  useEffect(() => {
    document.title = "CleanNest — Trusted Local Home Services";
  }, []);

  const handleCategorySelect = (name) => {
    setSelectedCategory((prev) => (prev === name ? "" : name));
  };

  const { categories, loading: catsLoading } = useCategories();
  const featured = useProviderSearch({ category: selectedCategory, pageSize: selectedCategory ? 12 : 6 });

  return (
    <div className="page">
      <Hero />

      <CategorySection
        categories={catsLoading && !categories.length ? fallbackCategories : categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Featured</span>
            <h2>Top Local Professionals</h2>
            <p>
              {selectedCategory
                ? `Showing ${selectedCategory} providers.`
                : "A handpicked selection of trusted providers near you."}
            </p>
          </div>

          <ProviderResults
            req={featured}
            hidePagination
            onBook={openBooking}
            onView={openDetails}
            onClearFilters={() => setSelectedCategory("")}
          />
        </div>
      </section>

      <WhyChoose benefits={benefits} />
      <Stats stats={stats} />
      <HowItWorks steps={steps} />
      <CtaBanner onBook={() => navigate("/providers")} />

      {modals}
    </div>
  );
}