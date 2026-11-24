import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import StatusProgress from "@/components/StatusProgress";
import { ROLES } from "@/lib/constants";
import { getReports } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";
import { statusStyle } from "@/lib/status-styles";

export const metadata = { title: "My Reports · LabFix" };

// Main call-to-action in school yellow.
function ReportButton() {
  return (
    <Link
      href="/report"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 font-bold text-brand-950 shadow-sm hover:bg-gold-300"
    >
      <span aria-hidden="true" className="text-lg leading-none">+</span>
      Report an Issue
    </Link>
  );
}

export default async function MyReportsPage() {
  const user = await requireRole(ROLES.REPORTER);
  // Only this user's reports. The filter is done on the server.
  const reports = await getReports({ reporterId: user.id });

  return (
    <div>
      <PageHeader title="My Reports" subtitle="Track the status of the issues you reported." action={<ReportButton />} />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          message="When you report a broken computer, it will appear here so you can follow its status."
          action={<ReportButton />}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => {
            const latest = r.history[r.history.length - 1];
            // Show the latest IT Support remark (not the reporter's own "Report submitted").
            const itRemark = r.history.length > 1 && latest?.remarks ? latest.remarks : "";
            return (
              <li
                key={r.id}
                className={`flex flex-col rounded-xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm ${statusStyle(r.status).border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-brand-700">{r.id}</p>
                    <h2 className="mt-0.5 font-bold text-brand-950">{r.issueType}</h2>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {r.labName} · <span className="font-semibold text-slate-800">{r.pcNumber}</span>
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">{r.description}</p>
                {itRemark && (
                  <p className="mt-3 rounded-lg border-l-2 border-gold-400 bg-gold-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-bold text-brand-900">IT Support:</span> {itRemark}
                  </p>
                )}
                <div className="mt-4">
                  <StatusProgress status={r.status} />
                </div>
                <p className="mt-3 text-xs text-slate-500">Reported {formatDate(r.createdAt)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
