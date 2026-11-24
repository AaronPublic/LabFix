// LabFix logo: a monitor with a check mark, plus the name.
// variant="light" is for blue backgrounds (navbar, login panel).
export default function Logo({ variant = "dark" }) {
  const light = variant === "light";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 text-brand-900 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
          <path d="M9 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}>
        Lab<span className={light ? "text-gold-400" : "text-crimson-600"}>Fix</span>
      </span>
    </span>
  );
}
