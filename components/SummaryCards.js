// The four count cards at the top of the dashboard.
// Total = solid school blue; each status card uses its status color.
const ICONS = {
  total: <path d="M9 12h6M9 16h6M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />,
  pending: <path d="M12 8v5m0 3h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />,
  progress: <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" />,
  resolved: <path d="M5 13l4 4L19 7" />,
};

function Icon({ name, className }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        {ICONS[name]}
      </svg>
    </span>
  );
}

export default function SummaryCards({ stats }) {
  const cards = [
    { label: "Pending", value: stats.pending, icon: "pending", iconClass: "bg-crimson-50 text-crimson-600", bar: "bg-crimson-600", text: "text-crimson-700" },
    { label: "In Progress", value: stats.inProgress, icon: "progress", iconClass: "bg-gold-100 text-gold-700", bar: "bg-gold-400", text: "text-gold-800" },
    { label: "Resolved", value: stats.resolved, icon: "resolved", iconClass: "bg-brand-50 text-brand-700", bar: "bg-brand-700", text: "text-brand-800" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {/* Total: the "hero" card in solid school blue */}
      <div className="relative overflow-hidden rounded-xl bg-brand-900 p-4 text-white shadow-sm sm:p-5">
        <span className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gold-400/20" aria-hidden="true" />
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-brand-100">Total Reports</p>
          <Icon name="total" className="bg-white/10 text-gold-300" />
        </div>
        <p className="mt-1 text-3xl font-extrabold">{stats.total}</p>
      </div>

      {cards.map((card) => (
        <div key={card.label} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <span className={`absolute inset-x-0 top-0 h-1 ${card.bar}`} aria-hidden="true" />
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-600">{card.label}</p>
            <Icon name={card.icon} className={card.iconClass} />
          </div>
          <p className={`mt-1 text-3xl font-extrabold ${card.text}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
