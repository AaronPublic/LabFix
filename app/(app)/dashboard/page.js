import EmptyState from "@/components/EmptyState";
import Filters from "@/components/Filters";
import PageHeader from "@/components/PageHeader";
import ReportsTable from "@/components/ReportsTable";
import SummaryCards from "@/components/SummaryCards";
import { ROLES, STATUS_LIST } from "@/lib/constants";
import { getLabs, getReportStats, getReports } from "@/lib/data";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Dashboard · LabFix" };

export default async function DashboardPage({ searchParams }) {
  await requireRole(ROLES.IT_SUPPORT); // server-side role check

  const params = await searchParams; // searchParams is async in Next.js 16
  const labs = await getLabs();

  // Only accept filter values we know about. Ignore anything else.
  const lab = labs.some((l) => l.id === params.lab) ? params.lab : "";
  const status = STATUS_LIST.includes(params.status) ? params.status : "";

  const [stats, reports] = await Promise.all([
    getReportStats(),
    getReports({ labId: lab || undefined, status: status || undefined }),
  ]);

  return (
    <div>
      <PageHeader title="IT Support Dashboard" subtitle="All reported computer issues across the labs." />
      <SummaryCards stats={stats} />
      {/* key resets the form when the URL changes */}
      <Filters key={`${lab}|${status}`} labs={labs} lab={lab} status={status} />

      {reports.length === 0 ? (
        <EmptyState
          title={lab || status ? "No reports match these filters" : "No reports yet"}
          message={lab || status ? "Try another lab or status, or clear the filters." : "New issue reports will appear here."}
        />
      ) : (
        <>
          <p className="mb-2 text-sm text-slate-500">
            Showing {reports.length} report{reports.length === 1 ? "" : "s"}
          </p>
          <ReportsTable reports={reports} />
        </>
      )}
    </div>
  );
}
