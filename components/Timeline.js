// Activity timeline: every status change of a report, newest first.
import { formatDateTime } from "@/lib/format";
import { statusStyle } from "@/lib/status-styles";

export default function Timeline({ history }) {
  const items = [...history].reverse();

  return (
    <ol className="relative space-y-6 border-l-2 border-brand-100 pl-6">
      {items.map((item, index) => (
        <li key={index} className="relative">
          <span
            className={`absolute top-1 -left-[31px] h-3.5 w-3.5 rounded-full ring-4 ring-white ${statusStyle(item.status).dot}`}
            aria-hidden="true"
          />
          <p className="text-sm font-bold text-brand-950">{item.status}</p>
          <p className="text-xs text-slate-500">
            {formatDateTime(item.at)} · by {item.by}
          </p>
          {item.remarks && (
            <p className="mt-1.5 rounded-lg border-l-2 border-gold-400 bg-gold-50 px-3 py-2 text-sm text-slate-700">{item.remarks}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
