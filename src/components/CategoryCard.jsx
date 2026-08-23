import "../styles/CategoryCard.css";

// Props: category object, selected boolean, onSelect callback
export default function CategoryCard({ category, selected, onSelect }) {
  return (
    <article
      className={`category-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect?.(category.name)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(category.name);
        }
      }}
      role="button"
      aria-pressed={selected}
    >
      <div className="category-card-icon" aria-hidden="true">
        {category.icon}
      </div>
      <h3 className="category-card-title">{category.name}</h3>
      <p className="category-card-desc">{category.description}</p>
      <div className="category-card-meta">
        <span className="badge badge-neutral">{category.providersCount} providers</span>
      </div>
      <button
        className="btn btn-outline category-card-btn"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(category.name);
        }}
      >
        View Services →
      </button>
      {selected && <span className="category-card-check" aria-hidden="true">✓</span>}
    </article>
  );
}
