export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      <span className="pagination-info">Page {page} of {totalPages}</span>
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
    </nav>
  );
}
