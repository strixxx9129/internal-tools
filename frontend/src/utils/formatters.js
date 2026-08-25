export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** A task is overdue when its due date passed and it is not completed. */
export function isOverdue(task) {
  return (
    !!task.due_date &&
    task.status !== 'completed' &&
    new Date(task.due_date) < new Date()
  );
}
