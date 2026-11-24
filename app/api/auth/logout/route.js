// POST /api/auth/logout: deletes the session cookie.
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/request";
import { clearSessionCookie } from "@/lib/session";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
