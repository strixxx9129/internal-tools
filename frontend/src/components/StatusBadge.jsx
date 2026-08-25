import { STATUS_STYLES, statusLabel } from '../utils/constants';

export default function StatusBadge({ status }) {
  const styles =
    STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {statusLabel(status)}
    </span>
  );
}
