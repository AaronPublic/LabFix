// Three-step progress bar: Pending -> In Progress -> Resolved.
// Shows reporters at a glance how far along their report is.
import { STATUS_LIST } from "@/lib/constants";
import { statusStyle } from "@/lib/status-styles";

export default function StatusProgress({ status }) {
  const current = STATUS_LIST.indexOf(status);

  return (
    <ol className="flex items-center gap-1.5" aria-label={`Progress: ${status}`}>
      {STATUS_LIST.map((step, index) => {
        const reached = index <= current;
        return (
          <li key={step} className="flex-1">
            <span
              className={`block h-1.5 rounded-full ${reached ? statusStyle(status).dot : "bg-slate-200"}`}
              aria-hidden="true"
            />
            <span className={`mt-1 block text-[11px] font-semibold ${reached ? "text-slate-700" : "text-slate-400"}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
