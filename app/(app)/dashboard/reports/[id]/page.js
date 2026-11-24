import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import StatusBadge from "@/components/StatusBadge";
import StatusProgress from "@/components/StatusProgress";
import StatusUpdateForm from "@/components/StatusUpdateForm";
import Timeline from "@/components/Timeline";
import { ROLES } from "@/lib/constants";
import { getReportById } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/session";
import { getPhotoUrl } from "@/lib/storage";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `${id} · LabFix` };
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-brand-700 uppercase">{label}</dt>
      <dd className="mt-1 text-slate-900">{children}</dd>
    </div>
  );
}

// White card with a title that has a small yellow marker.
function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-bold text-brand-950">
        <span className="h-4 w-1 rounded-full bg-gold-400" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ReportDetailsPage({ params }) {
  // Check the role BEFORE loading the report.
  await requireRole(ROLES.IT_SUPPORT);

  const { id } = await params; // params is async in Next.js 16
  const report = await getReportById(id);
  if (!report) notFound();

  const photoUrl = await getPhotoUrl(report.photoKey);

  return (
    <div>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
        <span aria-hidden="true">←</span> Back to dashboard
      </Link>

      {/* Header banner in school blue */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-brand-900 p-5 text-white shadow-sm sm:p-6">
        <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold-400/15" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-gold-300 uppercase">Report</p>
            <h1 className="font-mono text-2xl font-extrabold sm:text-3xl">{report.id}</h1>
            <p className="mt-1 text-sm text-brand-100">
              {report.labName} · {report.pcNumber} · {report.issueType}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>
        <div className="relative mt-5 rounded-lg bg-white p-3">
          <StatusProgress status={report.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details + photo */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Report details">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Lab">{report.labName}</Detail>
              <Detail label="PC Number">{report.pcNumber}</Detail>
              <Detail label="Issue Type">{report.issueType}</Detail>
              <Detail label="Reported by">{report.reporterName}</Detail>
              <Detail label="Date reported">{formatDateTime(report.createdAt)}</Detail>
              <Detail label="Last updated">{formatDateTime(report.updatedAt)}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Description">
                  <span className="whitespace-pre-line">{report.description}</span>
                </Detail>
              </div>
            </dl>
          </Card>

          <Card title="Photo">
            <PhotoPlaceholder photoUrl={photoUrl} photoKey={report.photoKey} />
          </Card>
        </div>

        {/* Right: status form + timeline */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 bg-gold-400" aria-hidden="true" />
            <div className="p-5 sm:p-6">
              <h2 className="mb-4 font-bold text-brand-950">Update status</h2>
              <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
            </div>
          </section>

          <Card title="Activity">
            <Timeline history={report.history} />
          </Card>
        </div>
      </div>
    </div>
  );
}
