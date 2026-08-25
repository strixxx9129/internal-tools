import { useCallback, useEffect, useState } from 'react';

import Pagination from '../components/Pagination';
import Table from '../components/Table';
import useDocumentTitle from '../hooks/useDocumentTitle';
import auditService from '../services/auditService';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/helpers';

const PAGE_SIZE = 15;

export default function AuditLogsPage() {
  useDocumentTitle('Audit Logs');
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await auditService.list({ page, limit: PAGE_SIZE });
      setData(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'created_at', label: 'Time', render: (log) => formatDateTime(log.created_at) },
    {
      key: 'user_name',
      label: 'User',
      render: (log) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{log.user_name}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {log.action}
        </code>
      ),
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (log) => `${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`,
    },
    { key: 'details', label: 'Details', render: (log) => log.details || '—' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Security-relevant actions recorded across the application (admin only).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={data.items}
        loading={loading}
        emptyTitle="No audit entries yet"
        emptyMessage="Logins and task/user changes will appear here."
      />

      <Pagination
        page={data.page}
        pages={data.pages}
        total={data.total}
        limit={data.limit}
        onPageChange={setPage}
      />
    </div>
  );
}
