import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";
import { ROLES } from "@/lib/constants";
import { getLabs } from "@/lib/data";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Report an Issue · LabFix" };

export default async function ReportPage() {
  await requireRole(ROLES.REPORTER); // server-side role check
  const labs = await getLabs();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Report an Issue"
        subtitle="Found a broken computer? Tell us where it is and what is wrong. A photo helps IT Support fix it faster."
      />
      <ReportForm labs={labs} />
    </div>
  );
}
