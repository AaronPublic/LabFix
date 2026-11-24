// POST /api/reports: a Reporter submits a new issue report (with photo).
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/constants";
import { createReport } from "@/lib/data";
import { isSameOrigin } from "@/lib/request";
import { requireApiRole } from "@/lib/session";
import { uploadPhoto } from "@/lib/storage";
import { validatePhoto, validateReport } from "@/lib/validation";

export async function POST(request) {
  // 1. Only logged-in Reporters (401 / 403 otherwise).
  const { user, error } = await requireApiRole(ROLES.REPORTER);
  if (error) return error;

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  // 2. Read the multipart form data.
  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // 3. Validate the text fields and the photo.
  const report = await validateReport({
    labId: form.get("labId"),
    pcNumber: form.get("pcNumber"),
    issueType: form.get("issueType"),
    description: form.get("description"),
  });
  const photo = await validatePhoto(form.get("photo"));

  if (!report.ok || !photo.ok) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fields: { ...report.errors, ...photo.errors } },
      { status: 400 }
    );
  }

  // 4. Save the photo (placeholder), then save the report.
  const photoKey = await uploadPhoto(photo.data.buffer, photo.data.ext, photo.data.contentType);
  const saved = await createReport({ ...report.data, photoKey }, user);

  return NextResponse.json({ id: saved.id }, { status: 201 });
}
