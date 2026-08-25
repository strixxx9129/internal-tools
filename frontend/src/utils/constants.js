export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
];

export const STATUS_STYLES = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
};

export const PRIORITY_STYLES = {
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
};

export const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  member: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

export const statusLabel = (value) =>
  STATUSES.find((s) => s.value === value)?.label ?? value;

export const priorityLabel = (value) =>
  PRIORITIES.find((p) => p.value === value)?.label ?? value;
