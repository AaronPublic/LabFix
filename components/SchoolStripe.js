// Thin blue / yellow / red band: the school colors as a brand accent.
export default function SchoolStripe({ className = "h-1" }) {
  return (
    <div className={`flex w-full ${className}`} aria-hidden="true">
      <span className="flex-[3] bg-brand-700" />
      <span className="flex-1 bg-gold-400" />
      <span className="flex-1 bg-crimson-600" />
    </div>
  );
}
