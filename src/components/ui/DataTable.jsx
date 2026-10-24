// Reusable sortable table. columns: [{ key, label, sortable?, render?(row), className? }]
// sort = { key, dir } and onSort(key) come from useListControls.
export default function DataTable({ columns, rows, rowKey = "id", sort, onSort, caption }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} scope="col" className={c.className} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                  {c.sortable ? (
                    <button type="button" className="th-sort" onClick={() => onSort(c.key)}>
                      {c.label}
                      <span aria-hidden="true">{active ? (sort.dir === "asc" ? " ▲" : " ▼") : " ↕"}</span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label} className={c.className}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
