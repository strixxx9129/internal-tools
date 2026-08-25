import { useCallback, useEffect, useState } from 'react';

import taskService from '../services/taskService';
import { getErrorMessage } from '../utils/helpers';

/** Fetches a paginated/filtered task list from the backend. */
export default function useTasks(params) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const paramsKey = JSON.stringify(params);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.list(JSON.parse(paramsKey));
      setData(response.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { ...data, loading, error, refetch: fetchTasks };
}
