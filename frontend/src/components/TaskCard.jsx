import { Link } from 'react-router-dom';

import { formatDate, isOverdue } from '../utils/formatters';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TaskCard({ task }) {
  const overdue = isOverdue(task);
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-medium text-slate-900 dark:text-white">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>{task.assignee?.name ?? 'Unassigned'}</span>
        <PriorityBadge priority={task.priority} />
        <span className={overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}>
          {task.due_date ? `Due ${formatDate(task.due_date)}` : 'No due date'}
        </span>
      </div>
    </Link>
  );
}
