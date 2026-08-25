import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

/** Wraps routes that need authentication (and optionally specific roles). */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !hasRole(...roles)) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Access denied</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You need one of these roles: {roles.join(', ')}.
        </p>
      </div>
    );
  }
  return children;
}
