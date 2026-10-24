import { useMemo, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue.js";

// Search + filter + sort + pagination for in-memory lists (bookings, users, tables).
//
// config = {
//   searchFields: [(item) => string, ...],
//   filters:      { status: (item, value) => boolean, ... },   // "" / "all" value = no filtering
//   sortAccessors:{ date: (item) => value, ... },
//   defaultSort:  { key: "date", dir: "desc" },
//   pageSize:     8,
//   debounceMs:   250,
// }
export function useListControls(items, config) {
  const { searchFields = [], filters = {}, sortAccessors = {}, defaultSort, pageSize = 8, debounceMs = 250 } = config;

  const [search, setSearchRaw] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState(defaultSort || null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const setSearch = (v) => {
    setSearchRaw(v);
    setPage(1);
  };
  const setFilter = (key, value) => {
    setFilterValues((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const toggleSort = (key) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const clear = () => {
    setSearchRaw("");
    setFilterValues({});
    setSort(defaultSort || null);
    setPage(1);
  };

  const hasActiveFilters = !!search || Object.values(filterValues).some((v) => v && v !== "all");

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let out = items.filter((item) => {
      if (q && !searchFields.some((fn) => String(fn(item) ?? "").toLowerCase().includes(q))) return false;
      return Object.entries(filterValues).every(([key, value]) => {
        if (!value || value === "all" || !filters[key]) return true;
        return filters[key](item, value);
      });
    });
    if (sort && sortAccessors[sort.key]) {
      const get = sortAccessors[sort.key];
      const mul = sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const x = get(a);
        const y = get(b);
        if (typeof x === "number" && typeof y === "number") return (x - y) * mul;
        return String(x ?? "").localeCompare(String(y ?? "")) * mul;
      });
    }
    return out;
    // searchFields/filters/sortAccessors are static config objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, debouncedSearch, filterValues, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    search, setSearch,
    filterValues, setFilter,
    sort, toggleSort, setSort,
    page: safePage, setPage, totalPages,
    results: paged,
    filtered,
    total: filtered.length,
    clear,
    hasActiveFilters,
  };
}
