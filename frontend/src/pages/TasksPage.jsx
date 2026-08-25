import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import PriorityBadge from '../components/PriorityBadge';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import TaskFormModal from '../components/TaskFormModal';
import { useAuth } from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useTasks from '../hooks/useTasks';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { formatDate, isOverdue } from '../utils/formatters';
import { getErrorMessage } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created date' },
  { value: 'updated_at', label: 'Updated date' },
  { value: 'due_date', label: 'Due date' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

const PAGE_SIZE = 10;

export default function TasksPage() {
  useDocumentTitle('Tasks');
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canDelete = hasRole('admin', 'manager');

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
  });
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, task: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Reset to page 1 whenever filters/search change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.priority, filters.assignee, filters.sort_by, filters.sort_dir]);

  useEffect(() => {
    userService
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assignee: filters.assignee || undefined,
      sort_by: filters.sort_by,
      sort_dir: filters.sort_dir,
    }),
    [page, debouncedSearch, filters]
  );

  const { items, total, pages, limit, loading, error, refetch } = useTasks(params);

  const updateFilter = (field) => (event) =>
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));

  const handleDelete = async () => {
    setDeleting(true);
    setActionError('');
    try {
      await taskService.remove(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete the task'));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (task) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-900 dark:text-white">{task.title}</p>
          {task.description && (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      render: (task) =>
        task.assignee?.name ?? <span className="text-slate-400">Unassigned</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: 'due_date',
      label: 'Due',
      render: (task) => (
        <span className={isOverdue(task) ? 'font-medium text-red-600 dark:text-red-400' : ''}>
          {formatDate(task.due_date)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (task) => formatDate(task.created_at),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      render: (task) => formatDate(task.updated_at),
    },
    {
      key: 'actions',
      label: '',
      render: (task) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={() => setModal({ open: true, task })}>
            Edit
          </Button>
          {canDelete && (
            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(task)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, filter and track the team&apos;s tasks.
          </p>
        </div>
        <Button onClick={() => setModal({ open: true, task: null })}>+ New Task</Button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            name="search"
            placeholder="Search title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          name="status"
          placeholder="All statuses"
          options={STATUSES}
          value={filters.status}
          onChange={updateFilter('status')}
        />
        <Select
          name="priority"
          placeholder="All priorities"
          options={PRIORITIES}
          value={filters.priority}
          onChange={updateFilter('priority')}
        />
        <Select
          name="assignee"
          placeholder="All assignees"
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          value={filters.assignee}
          onChange={updateFilter('assignee')}
        />
        <div className="flex gap-2">
          <Select
            name="sort_by"
            options={SORT_OPTIONS}
            value={filters.sort_by}
            onChange={updateFilter('sort_by')}
          />
          <Button
            variant="secondary"
            title="Toggle sort direction"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sort_dir: prev.sort_dir === 'asc' ? 'desc' : 'asc',
              }))
            }
          >
            {filters.sort_dir === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
          {error || actionError}
        </div>
      )}

      <Table
        columns={columns}
        data={items}
        loading={loading}
        emptyTitle="No tasks match your filters"
        emptyMessage="Try adjusting the filters or create a new task."
        onRowClick={(task) => navigate(`/tasks/${task.id}`)}
      />

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      <TaskFormModal
        open={modal.open}
        task={modal.task}
        users={users}
        onClose={() => setModal({ open: false, task: null })}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
