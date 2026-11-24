// Skeleton shown while the dashboard loads.
export default function Loading() {
  return (
    <div className="animate-pulse" aria-label="Loading">
      <div className="mb-2 h-1 w-10 rounded-full bg-gold-200" />
      <div className="mb-6 h-8 w-64 rounded bg-brand-100" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="h-24 rounded-xl bg-brand-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-brand-100/70" />
        ))}
      </div>
      <div className="mb-4 h-20 rounded-xl bg-brand-100/70" />
      <div className="h-72 rounded-xl bg-brand-100/70" />
    </div>
  );
}
