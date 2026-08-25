export default function EmptyState({ title = 'Nothing here yet', message, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
      <svg
        className="h-10 w-10 text-slate-300 dark:text-slate-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.6a1 1 0 00-.9.55l-.8 1.6a1 1 0 01-.9.55H9.2a1 1 0 01-.9-.55l-.8-1.6a1 1 0 00-.9-.55H4"
        />
      </svg>
      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      {message && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
