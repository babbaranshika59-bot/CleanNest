import BookingList from "./BookingList.jsx";
import Tabs from "../ui/Tabs.jsx";
import FilterBar from "../ui/FilterBar.jsx";
import Pagination from "../ui/Pagination.jsx";
import { ErrorState, LoadingState } from "../ui/States.jsx";
import { useBookings } from "../../context/BookingContext.jsx";
import { useListControls } from "../../hooks/useListControls.js";
import { useBookingActions } from "../../hooks/useBookingActions.jsx";

const SORTS = {
  newest: { key: "createdAt", dir: "desc" },
  oldest: { key: "createdAt", dir: "asc" },
  soonest: { key: "date", dir: "asc" },
  "price-desc": { key: "price", dir: "desc" },
  "price-asc": { key: "price", dir: "asc" },
};
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "soonest", label: "Service date (soonest)" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "price-asc", label: "Price: low → high" },
];

// Tabbed + searchable + sortable list of the signed-in user's bookings.
// tabs: [{ key, label, match(booking) }] — the first tab is the default.
export default function BookingsExplorer({ tabs, emptyTitle, emptyMessage, emptyAction }) {
  const { bookings, loading, error, reload } = useBookings();
  const { run, modal, busyId } = useBookingActions();

  const ctl = useListControls(bookings, {
    searchFields: [(b) => b.id, (b) => b.service, (b) => b.providerName, (b) => b.customerName, (b) => b.category],
    filters: { tab: (b, key) => tabs.find((t) => t.key === key)?.match(b) ?? true },
    sortAccessors: { createdAt: (b) => b.createdAt, date: (b) => `${b.date} ${b.time}`, price: (b) => b.price },
    defaultSort: SORTS.newest,
    pageSize: 6,
  });

  const activeTab = ctl.filterValues.tab || tabs[0].key;
  const tabItems = tabs.map((t) => ({ key: t.key, label: t.label, count: bookings.filter(t.match).length }));
  const sortValue = Object.entries(SORTS).find(([, v]) => v.key === ctl.sort?.key && v.dir === ctl.sort?.dir)?.[0] || "newest";

  if (loading && !bookings.length) return <LoadingState label="Loading your bookings…" />;
  if (error && !bookings.length) return <ErrorState error={error} onRetry={reload} title="Couldn't load bookings" />;

  return (
    <>
      <Tabs tabs={tabItems} active={activeTab} onChange={(k) => ctl.setFilter("tab", k)} label="Booking status" />
      <FilterBar
        search={ctl.search}
        onSearch={ctl.setSearch}
        placeholder="Search by ID, service, name…"
        hasActive={ctl.hasActiveFilters && (!!ctl.search || (activeTab !== tabs[0].key))}
        onClear={ctl.clear}
        total={ctl.total}
        noun="booking"
      >
        <select className="select filter-select" value={sortValue} onChange={(e) => ctl.setSort(SORTS[e.target.value])} aria-label="Sort bookings">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterBar>

      <BookingList
        bookings={ctl.results}
        onAction={run}
        busyId={busyId}
        emptyTitle={ctl.hasActiveFilters || activeTab !== tabs[0].key ? "No bookings match" : emptyTitle}
        emptyMessage={ctl.hasActiveFilters || activeTab !== tabs[0].key ? "Try a different tab or clear your search." : emptyMessage}
        emptyAction={ctl.hasActiveFilters || activeTab !== tabs[0].key ? undefined : emptyAction}
      />
      <Pagination page={ctl.page} totalPages={ctl.totalPages} onPage={ctl.setPage} />
      {modal}
    </>
  );
}
