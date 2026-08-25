import { useDroppable } from '@dnd-kit/core';

import { statusLabel } from '../utils/constants';

const TOP_ACCENTS = {
  pending: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  completed: 'border-t-green-500',
  blocked: 'border-t-red-500',
};

/** One droppable status column on the Kanban board. */
export default function KanbanColumn({ status, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${statusLabel(status)} column`}
      className={`flex max-h-[calc(100vh-16rem)] flex-col rounded-xl border border-t-4 bg-white shadow-sm transition-colors dark:bg-slate-800 ${
        TOP_ACCENTS[status] ?? 'border-t-slate-400'
      } ${
        isOver
          ? 'border-indigo-400 ring-2 ring-indigo-200 dark:border-indigo-500 dark:ring-indigo-900'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {statusLabel(status)}
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {count}
        </span>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {count === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-600 dark:text-slate-500">
            Drop tasks here
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
