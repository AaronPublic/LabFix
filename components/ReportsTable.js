// Reports list for IT Support: a table on large screens, cards on phones.
// Pending (new) reports get a red "New" pill and a red left edge.
import Link from "next/link";
import { STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { statusStyle } from "@/lib/status-styles";
import StatusBadge from "./StatusBadge";

function NewPill() {
  return (
    <span className="rounded-full bg-crimson-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">New</span>
  );
}

function ViewLink({ id }) {
  return (
    <Link
      href={`/dashboard/reports/${id}`}
      className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
    >
      View <span aria-hidden="true">→</span>
    </Link>
  );
}

export default function ReportsTable({ reports }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-900 text-xs tracking-wide text-brand-100 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Report ID</th>
              <th className="px-4 py-3 font-bold">Lab / PC</th>
              <th className="px-4 py-3 font-bold">Issue</th>
              <th className="px-4 py-3 font-bold">Reported by</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => {
              const isNew = r.status === STATUSES.PENDING;
              return (
                <tr
                  key={r.id}
                  className={`border-l-4 ${statusStyle(r.status).border} ${isNew ? "bg-crimson-50/40" : "hover:bg-brand-50/50"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-900">{r.id}</span>
                      {isNew && <NewPill />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.labName}</p>
                    <p className="text-xs text-slate-500">{r.pcNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.issueType}</td>
                  <td className="px-4 py-3 text-slate-700">{r.reporterName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ViewLink id={r.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {reports.map((r) => {
          const isNew = r.status === STATUSES.PENDING;
          return (
            <li
              key={r.id}
              className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm ${statusStyle(r.status).border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-900">{r.id}</span>
                  {isNew && <NewPill />}
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 font-semibold text-slate-900">{r.issueType}</p>
              <p className="text-sm text-slate-600">
                {r.labName} · {r.pcNumber}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {r.reporterName} · {formatDate(r.createdAt)}
                </p>
                <ViewLink id={r.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
