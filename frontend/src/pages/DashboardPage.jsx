import { useEffect, useState } from 'react';

import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import dashboardService from '../services/dashboardService';
import { PRIORITIES, priorityLabel } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const PRIORITY_BAR_COLORS = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardService.get();
      setStats(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load the dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  const cards = [
    { label: 'Total Tasks', value: stats.total_tasks },
    { label: 'Pending', value: stats.pending, accent: 'text-slate-500 dark:text-slate-300' },
    { label: 'In Progress', value: stats.in_progress, accent: 'text-blue-600 dark:text-blue-400' },
    { label: 'Completed', value: stats.completed, accent: 'text-green-600 dark:text-green-400' },
    { label: 'Overdue', value: stats.overdue, accent: 'text-red-600 dark:text-red-400' },
    { label: 'Assigned to Me', value: stats.my_tasks, hint: 'open tasks', accent: 'text-indigo-600 dark:text-indigo-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A quick overview of the team&apos;s work.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Tasks by priority
          </h2>
          <div className="mt-4 space-y-3">
            {PRIORITIES.map(({ value }) => {
              const count = stats.tasks_by_priority[value] || 0;
              const pct = stats.total_tasks ? Math.round((count / stats.total_tasks) * 100) : 0;
              return (
                <div key={value}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{priorityLabel(value)}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${PRIORITY_BAR_COLORS[value]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Unassigned tasks: {stats.unassigned}
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Recently updated
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stats.recent_tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {stats.recent_tasks.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tasks yet — create your first one from the Tasks page.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
