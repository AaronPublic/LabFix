// PATCH /api/reports/[id]: IT Support updates a report's status and remarks.
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/constants";
import { getReportById, updateReportStatus } from "@/lib/data";
import { isSameOrigin } from "@/lib/request";
import { requireApiRole } from "@/lib/session";
import { validateStatusUpdate } from "@/lib/validation";

export async function PATCH(request, { params }) {
  // Only logged-in IT Support staff (401 / 403 otherwise).
  const { user, error } = await requireApiRole(ROLES.IT_SUPPORT);
  if (error) return error;

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const { id } = await params; // params is async in Next.js 16

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { ok, errors, data } = validateStatusUpdate(body);
  if (!ok) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: errors }, { status: 400 });
  }

  const existing = await getReportById(id);
  if (!existing) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (existing.status === data.status && !data.remarks) {
    return NextResponse.json(
      { error: "Choose a different status or add a remark.", fields: { status: "No changes to save." } },
      { status: 400 }
    );
  }

  const updated = await updateReportStatus(id, data.status, data.remarks, user);
  return NextResponse.json({ report: updated });
}
