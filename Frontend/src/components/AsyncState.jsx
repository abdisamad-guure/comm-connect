import { FiAlertCircle, FiInbox, FiLoader } from 'react-icons/fi';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
      <FiLoader className="animate-spin text-teal-700" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}



export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">We could not load this information.</p>
          <p className="mt-1 text-sm">{message}</p>
          {onRetry && <button className="mt-3 text-sm font-semibold underline" onClick={onRetry}>Try again</button>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <FiInbox className="mb-3 text-3xl text-slate-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
