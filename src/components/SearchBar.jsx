import { useRef } from "react";
import "../styles/SearchBar.css";

// Controlled search bar with auto-focus support.
export default function SearchBar({
  query,
  onQueryChange,
  location,
  onLocationChange,
  onSubmit,
  autoFocus = false,
  showLocation = true,
  placeholder = "What service do you need?",
}) {
  const inputRef = useRef(null);

  // DOM interaction: focus the main search input when autoFocus is requested.
  if (autoFocus && inputRef.current && document.activeElement !== inputRef.current) {
    inputRef.current.focus();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <div className="searchbar-field">
        <span className="searchbar-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="searchbar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search services"
        />
      </div>

      {showLocation && (
        <div className="searchbar-field">
          <span className="searchbar-icon" aria-hidden="true">📍</span>
          <input
            type="text"
            className="searchbar-input"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            aria-label="Location"
          />
        </div>
      )}

      <button type="submit" className="btn btn-accent searchbar-btn">
        Search
      </button>
    </form>
  );
}
