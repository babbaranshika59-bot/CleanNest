import Button from "./Button.jsx";

// Search + select filters + clear button + results count. Used by every list/table.
// filters: [{ key, label, value, onChange, options: [{ value, label }] | string[] }]
export default function FilterBar({ search, onSearch, placeholder = "Search…", filters = [], hasActive, onClear, total, noun = "result", children }) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-row">
        <input type="search" className="input filter-search" placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} aria-label={placeholder} />
        {filters.map((f) => (
          <select key={f.key} className="select filter-select" value={f.value || ""} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
            <option value="">{f.label}</option>
            {f.options.map((o) => {
              const opt = typeof o === "string" ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
        ))}
        {children}
        {hasActive && <Button variant="ghost" size="sm" onClick={onClear}>Clear filters</Button>}
      </div>
      {total !== undefined && (
        <div className="results-count" aria-live="polite">
          {total} {noun}{total === 1 ? "" : "s"} found
        </div>
      )}
    </div>
  );
}
