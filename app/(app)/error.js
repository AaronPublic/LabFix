"use client";
// Shown when something goes wrong while loading a page.
export default function Error({ reset }) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
      <div className="h-1.5 bg-crimson-600" aria-hidden="true" />
      <div className="p-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-crimson-50 text-crimson-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
            <path d="M12 8v5m0 3h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-brand-950">Something went wrong</h2>
        <p className="mt-1 text-sm text-slate-600">Please try again. If the problem continues, contact IT Support.</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
