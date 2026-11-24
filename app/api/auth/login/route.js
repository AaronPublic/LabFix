// POST /api/auth/login  (placeholder: checks users from lib/data.js)
import { NextResponse } from "next/server";
import { ROLE_HOME } from "@/lib/constants";
import { findUserByEmail } from "@/lib/data";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { checkLoginAttempt, clearLoginAttempts, getClientIp } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { setSessionCookie } from "@/lib/session";
import { validateLogin } from "@/lib/validation";

// Always the same message, so attackers cannot tell which emails exist.
const GENERIC_ERROR = "Invalid email or password";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { ok, data } = validateLogin(body);
  if (!ok) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // Rate limit per IP + email.
  const limitKey = `${getClientIp(request)}|${data.email}`;
  if (!checkLoginAttempt(limitKey)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  const user = await findUserByEmail(data.email);
  // Check a dummy hash for unknown emails so both cases take similar time.
  const passwordOk = verifyPassword(data.password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !passwordOk) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  clearLoginAttempts(limitKey);
  await setSessionCookie(user);
  return NextResponse.json({ redirectTo: ROLE_HOME[user.role] });
}
