import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import CategorySection from "../components/CategorySection.jsx";
import ProviderList from "../components/ProviderList.jsx";
import { HowItWorks, WhyChoose, Stats, CtaBanner } from "../components/InfoSections.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { categories, providers, stats, benefits, steps } from "../data/sampleData.js";
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

  const filteredProviders = selectedCategory
    ? providers.filter((p) => p.category === selectedCategory)
    : providers.slice(0, 6);

  return (
    <div className="page">
      <Hero />

      <CategorySection
        categories={categories}
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

          <ProviderList
            providers={filteredProviders}
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