import { useCallback, useEffect, useState } from 'react';

import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import externalService from '../services/externalService';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/helpers';

/** External API integration demo — data proxied & cached by our backend. */
export default function DirectoryPage() {
  useDocumentTitle('Directory');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await externalService.users();
      setResult(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load the external directory'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Partner Directory</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            External contacts fetched from a public API through our backend
            (with timeout, error handling and a 5-minute cache).
          </p>
        </div>
        <Button variant="secondary" onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {result && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Source: {result.source} · {result.count} records · fetched at{' '}
          {formatDateTime(result.fetched_at)}
          {result.cached && ' · served from cache'}
        </p>
      )}

      {loading && <LoadingSpinner label="Contacting external API..." />}

      {!loading && error && (
        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && result && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((person) => (
            <div
              key={person.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {person.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{person.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{person.username}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between gap-2">
                  <dt>Email</dt>
                  <dd className="truncate text-slate-700 dark:text-slate-300">{person.email}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Company</dt>
                  <dd className="truncate text-slate-700 dark:text-slate-300">{person.company}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>City</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{person.city}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Website</dt>
                  <dd>
                    <a
                      href={`https://${person.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {person.website}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
