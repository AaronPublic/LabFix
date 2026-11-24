// Dashboard filters. A plain GET form, so the choices go into the URL
// (e.g. /dashboard?lab=lab-1&status=Pending) and work even without JavaScript.
import Link from "next/link";
import { STATUS_LIST } from "@/lib/constants";

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

export default function Filters({ labs, lab, status }) {
  const hasFilters = Boolean(lab || status);

  return (
    <form
      method="get"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 border-t-4 border-t-brand-700 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="lab" className="mb-1 block text-xs font-bold tracking-wide text-brand-900 uppercase">
          Lab
        </label>
        <select id="lab" name="lab" defaultValue={lab} className={selectClass}>
          <option value="">All labs</option>
          {labs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="status" className="mb-1 block text-xs font-bold tracking-wide text-brand-900 uppercase">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className={selectClass}>
          <option value="">All statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-brand-700 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-800 sm:flex-none"
        >
          Apply
        </button>
        {hasFilters && (
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg border border-crimson-200 px-4 py-2 text-center text-sm font-bold text-crimson-700 hover:bg-crimson-50 sm:flex-none"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
