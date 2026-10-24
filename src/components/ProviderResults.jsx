import ProviderList from "./ProviderList.jsx";
import Pagination from "./ui/Pagination.jsx";
import { ErrorState, LoadingState } from "./ui/States.jsx";

// Loading / error / empty / list / pagination for any provider search request (useAsync result).
export default function ProviderResults({ req, onPage, onBook, onView, onClearFilters, hidePagination }) {
  if (req.loading && !req.data) return <LoadingState label="Finding providers…" />;
  if (req.error && !req.data) return <ErrorState error={req.error} title="Couldn't load providers" onRetry={req.reload} />;
  const data = req.data;
  return (
    <div className={req.loading ? "is-refreshing" : ""}>
      {req.error && <ErrorState error={req.error} title="Couldn't refresh results" onRetry={req.reload} />}
      <ProviderList providers={data.items} onBook={onBook} onView={onView} onClearFilters={onClearFilters} />
      {!hidePagination && <Pagination page={data.page} totalPages={data.totalPages} onPage={onPage} />}
    </div>
  );
}
