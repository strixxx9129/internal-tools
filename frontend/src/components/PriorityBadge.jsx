import { PRIORITY_STYLES, priorityLabel } from '../utils/constants';

export default function PriorityBadge({ priority }) {
  const styles =
    PRIORITY_STYLES[priority] ??
    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {priorityLabel(priority)}
    </span>
  );
}
