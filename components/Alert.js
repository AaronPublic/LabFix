// Colored message box. type: "error" | "success" | "info"
const STYLES = {
  error: "border-crimson-200 border-l-crimson-600 bg-crimson-50 text-crimson-800",
  success: "border-brand-200 border-l-brand-700 bg-brand-50 text-brand-900",
  info: "border-gold-200 border-l-gold-500 bg-gold-50 text-gold-900",
};

export default function Alert({ type = "info", children }) {
  if (!children) return null;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-lg border border-l-4 px-4 py-3 text-sm font-medium ${STYLES[type]}`}
    >
      {children}
    </div>
  );
}
