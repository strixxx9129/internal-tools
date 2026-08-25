import { useEffect, useState } from 'react';

import taskService from '../services/taskService';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import Select from './Select';
import Textarea from './Textarea';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
};

/** Shared create/edit task form used by the task list and the task detail page. */
export default function TaskFormModal({ open, task, users, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      task
        ? {
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assigned_to: task.assigned_to ?? '',
            due_date: task.due_date ? task.due_date.slice(0, 16) : '',
          }
        : EMPTY_FORM
    );
  }, [open, task]);

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to === '' ? null : Number(form.assigned_to),
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };
    try {
      if (task) {
        await taskService.update(task.id, payload);
      } else {
        await taskService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save the task'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={task ? 'Edit Task' : 'New Task'}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={saving}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        <Input
          label="Title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Prepare release notes"
          value={form.title}
          onChange={update('title')}
        />
        <Textarea
          label="Description"
          name="description"
          rows={3}
          placeholder="What needs to be done?"
          value={form.description}
          onChange={update('description')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            name="status"
            options={STATUSES}
            value={form.status}
            onChange={update('status')}
          />
          <Select
            label="Priority"
            name="priority"
            options={PRIORITIES}
            value={form.priority}
            onChange={update('priority')}
          />
          <Select
            label="Assignee"
            name="assigned_to"
            placeholder="Unassigned"
            options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))}
            value={form.assigned_to}
            onChange={update('assigned_to')}
          />
          <Input
            label="Due date"
            name="due_date"
            type="datetime-local"
            value={form.due_date}
            onChange={update('due_date')}
          />
        </div>
      </form>
    </Modal>
  );
}
