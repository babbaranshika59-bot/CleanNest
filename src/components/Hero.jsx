import { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import { useRouter } from "../router/Router.jsx";
import "../styles/Hero.css";

// Props: onSearch callback (optional). If not provided, navigates to /providers.
export default function Hero({ onSearch }) {
  const { navigate } = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (onSearch) {
      onSearch(query, location);
    } else {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (location) params.set("loc", location);
      navigate(`/providers${params.toString() ? `?${params}` : ""}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-grid-pattern" />
      </div>

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-pill">
            <span className="hero-pill-dot" /> Now serving 20+ local areas
          </span>
          <h1 className="hero-title">
            Trusted Local Services, <br />
            Right at Your Doorstep
          </h1>
          <p className="hero-subtitle">
            CleanNest helps you find reliable local professionals for everyday home
            needs — cleaning, repairs, salon, painting and more.
          </p>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            location={location}
            onLocationChange={setLocation}
            onSubmit={handleSubmit}
            autoFocus
          />

          <div className="hero-flow" aria-hidden="true">
            <span className="hero-flow-step">Find</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-step">Choose</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-step">Book</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card hero-card-1">
            <span className="hero-card-icon">🧹</span>
            <div>
              <strong>Cleaning</strong>
              <span>From ₹499</span>
            </div>
          </div>
          <div className="hero-card hero-card-2">
            <span className="hero-card-icon">🔧</span>
            <div>
              <strong>Plumbing</strong>
              <span>From ₹199</span>
            </div>
          </div>
          <div className="hero-card hero-card-3">
            <span className="hero-card-icon">💇</span>
            <div>
              <strong>Salon</strong>
              <span>From ₹349</span>
            </div>
          </div>
          <div className="hero-badge">
            <span className="hero-badge-value">4.8★</span>
            <span className="hero-badge-label">Avg. rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
