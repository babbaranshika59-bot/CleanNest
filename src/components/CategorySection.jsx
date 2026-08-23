import CategoryCard from "./CategoryCard.jsx";
import "../styles/CategorySection.css";

// Props: categories, selectedCategory, onSelect, title
export default function CategorySection({
  categories,
  selectedCategory,
  onSelect,
  title = "What service do you need?",
  subtitle = "Pick a category to filter local professionals.",
}) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Categories</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              selected={selectedCategory === cat.name}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
