// Friendly message shown when a list has no items.
export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-brand-800 ring-4 ring-gold-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7" aria-hidden="true">
          <path d="M9 12h6M9 16h6M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
        </svg>
      </div>
      <h3 className="font-bold text-brand-950">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
