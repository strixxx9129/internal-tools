import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

/**
 * Generic table. `columns` entries: { key, label, render?, className? }.
 * Rows respond to `onRowClick` when provided.
 */
export default function Table({
  columns,
  data,
  loading = false,
  emptyTitle = 'No records found',
  emptyMessage,
  onRowClick,
}) {
  if (loading) return <LoadingSpinner />;
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60">
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`bg-white dark:bg-slate-800 ${
                onRowClick
                  ? 'cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  : ''
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 align-middle text-slate-700 dark:text-slate-300 ${
                    column.className || ''
                  }`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
