import Spinner from "./Spinner";

// Submit button that shows a spinner and is disabled while loading.
// variant: "primary" (school blue) | "accent" (school yellow)
const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  accent: "bg-gold-400 text-brand-950 hover:bg-gold-300",
};

export default function SubmitButton({ loading, loadingText = "Please wait...", children, className = "", variant = "primary" }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
        VARIANTS[variant] || VARIANTS.primary
      } ${className}`}
    >
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </button>
  );
}
