import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import Button from '../components/Button';
import DraggableTaskCard from '../components/DraggableTaskCard';
import Input from '../components/Input';
import KanbanColumn from '../components/KanbanColumn';
import LoadingSpinner from '../components/LoadingSpinner';
import Select from '../components/Select';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

export default function BoardPage() {
  useDocumentTitle('Board');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput);
  const [filters, setFilters] = useState({ priority: '', assignee: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // A board is a snapshot, not a paginated list: pull up to 100 tasks
      // (filtered server-side) and group them into columns client-side.
      const { data } = await taskService.list({
        limit: 100,
        sort_by: 'updated_at',
        sort_dir: 'desc',
        search: debouncedSearch || undefined,
        priority: filters.priority || undefined,
        assignee: filters.assignee || undefined,
      });
      setTasks(data.items);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load the board'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.priority, filters.assignee]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    userService
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s.value, []]));
    for (const task of tasks) grouped[task.status]?.push(task);
    return grouped;
  }, [tasks]);

  const activeTask = tasks.find((t) => t.id === activeId);

  // A small drag distance keeps plain clicks working (cards link to details).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const newStatus = over.id;
    if (!task || task.status === newStatus) return;

    // Optimistic update — revert if the API call fails.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    try {
      await taskService.update(task.id, { status: newStatus });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setError(getErrorMessage(err, 'Failed to move the task'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Board</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag cards between columns to change their status.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Task</Button>
      </div>

      {/* Filter bar (applied server-side, same as the task list) */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-3">
        <Input
          name="search"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          name="priority"
          placeholder="All priorities"
          options={PRIORITIES}
          value={filters.priority}
          onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
        />
        <Select
          name="assignee"
          placeholder="All assignees"
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          value={filters.assignee}
          onChange={(e) => setFilters((prev) => ({ ...prev, assignee: e.target.value }))}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading board..." />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STATUSES.map(({ value }) => (
              <KanbanColumn key={value} status={value} count={columns[value].length}>
                {columns[value].map((task) => (
                  <DraggableTaskCard key={task.id} task={task} />
                ))}
              </KanbanColumn>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-95 shadow-xl">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormModal
        open={modalOpen}
        task={null}
        users={users}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
