import { useCallback, useEffect, useState } from 'react';

import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Select from '../components/Select';
import Table from '../components/Table';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import userService from '../services/userService';
import { ROLE_STYLES, ROLES } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { getErrorMessage } from '../utils/helpers';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'member' };

export default function UsersPage() {
  useDocumentTitle('Team');
  const { user: currentUser, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.list();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await userService.create(form);
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create the user'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete the user'));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            ROLE_STYLES[u.role] ?? ''
          }`}
        >
          {u.role}
        </span>
      ),
    },
    { key: 'created_at', label: 'Joined', render: (u) => formatDate(u.created_at) },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            label: '',
            render: (u) =>
              u.id !== currentUser?.id && (
                <div className="flex justify-end">
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(u)}>
                    Delete
                  </Button>
                </div>
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            People who can be assigned to tasks.
          </p>
        </div>
        {isAdmin && <Button onClick={() => setCreateOpen(true)}>+ New User</Button>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyMessage="Create a user to start assigning tasks."
      />

      <Modal
        open={createOpen}
        title="New User"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" loading={saving}>
              Create user
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </div>
          )}
          <Input
            label="Name"
            name="name"
            required
            placeholder="Full name"
            value={form.name}
            onChange={update('name')}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            placeholder="user@company.com"
            value={form.email}
            onChange={update('email')}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={update('password')}
          />
          <Select
            label="Role"
            name="role"
            options={ROLES}
            value={form.role}
            onChange={update('role')}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget?.name}? Their tasks will become unassigned.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
