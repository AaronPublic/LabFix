import { statusStyle } from "@/lib/status-styles";

// Pending = red, In Progress = yellow, Resolved = blue (school colors)
export default function StatusBadge({ status }) {
  const style = statusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
