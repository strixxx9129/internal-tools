import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import TaskFormModal from '../components/TaskFormModal';
import Textarea from '../components/Textarea';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { STATUSES } from '../utils/constants';
import { formatDate, formatDateTime, isOverdue } from '../utils/formatters';
import { getErrorMessage } from '../utils/helpers';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  useDocumentTitle(task ? task.title : 'Task Details');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskService.get(id);
      setTask(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Task not found'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    userService
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, [load]);

  const handleStatusChange = async (event) => {
    try {
      await taskService.update(id, { status: event.target.value });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.remove(id);
      navigate('/tasks');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete the task'));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    try {
      await taskService.addComment(id, comment.trim());
      setComment('');
      await load();
    } catch (err) {
      setCommentError(getErrorMessage(err, 'Failed to add the comment'));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.removeComment(id, commentId);
      await load();
    } catch (err) {
      setCommentError(getErrorMessage(err, 'Failed to delete the comment'));
    }
  };

  if (loading) return <LoadingSpinner label="Loading task..." />;
  if (error && !task) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/tasks')}>
          Back to tasks
        </Button>
      </div>
    );
  }

  const overdue = isOverdue(task);
  const canDelete = hasRole('admin', 'manager');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        ← Back to tasks
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {overdue && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/60 dark:text-red-300">
                  Overdue
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              name="status"
              aria-label="Change status"
              options={STATUSES}
              value={task.status}
              onChange={handleStatusChange}
              className="w-40"
            />
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {canDelete && (
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-6 text-sm dark:border-slate-700 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <dt className="text-xs uppercase text-slate-400">Assignee</dt>
            <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              {task.assignee?.name ?? 'Unassigned'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Created by</dt>
            <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              {task.creator?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Due date</dt>
            <dd
              className={`mt-1 font-medium ${
                overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {formatDate(task.due_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Priority</dt>
            <dd className="mt-1 font-medium capitalize text-slate-800 dark:text-slate-200">
              {task.priority}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Created</dt>
            <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              {formatDateTime(task.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Last updated</dt>
            <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              {formatDateTime(task.updated_at)}
            </dd>
          </div>
        </dl>

        {task.description && (
          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
              {task.description}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comments */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Comments ({task.comments.length})
          </h2>
          <div className="mt-4 space-y-4">
            {task.comments.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No comments yet. Start the conversation below.
              </p>
            )}
            {task.comments.map((item) => (
              <div key={item.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {item.user?.name ?? 'Deleted user'}
                    <span className="ml-2 font-normal text-slate-400">
                      {formatDateTime(item.created_at)}
                    </span>
                  </p>
                  {(item.user?.id === user?.id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(item.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="mt-5 space-y-3">
            {commentError && (
              <p className="text-xs text-red-600 dark:text-red-400">{commentError}</p>
            )}
            <Textarea
              name="comment"
              rows={2}
              placeholder="Add a note or comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={commentLoading} disabled={!comment.trim()}>
                Add comment
              </Button>
            </div>
          </form>
        </div>

        {/* Activity history */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Activity</h2>
          <ol className="mt-4 space-y-4">
            {task.activities.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity recorded yet.</p>
            )}
            {task.activities.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-medium">{entry.user?.name ?? 'System'}</span>{' '}
                    {entry.detail || entry.action}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <TaskFormModal
        open={editOpen}
        task={task}
        users={users}
        onClose={() => setEditOpen(false)}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"? All comments and history will be removed.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
