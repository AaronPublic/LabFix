// Page title with an optional subtitle and a button on the right.
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="mb-2 block h-1 w-10 rounded-full bg-gold-400" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
