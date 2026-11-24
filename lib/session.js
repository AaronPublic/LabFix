// =============================================================
// lib/session.js: login sessions using a SIGNED cookie.
//
// The cookie holds: id, name, role, exp (expiry time).
// It is signed with HMAC-SHA256 using SESSION_SECRET, so if anyone
// changes the cookie (for example, edits role to "it_support"),
// the signature will not match and the cookie is rejected.
// Note: the cookie is signed, not encrypted. Never put secrets in it.
// =============================================================
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { ROLE_HOME, SESSION_COOKIE, SESSION_MAX_AGE } from "./constants";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short. Set it in .env.local (see .env.example).");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

// Build the cookie value: "<base64url JSON>.<signature>"
export function createSessionToken(user) {
  const data = {
    id: user.id,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

// Check the signature and expiry. Returns the session data, or null.
export function verifySessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature || "");

  // Compare signatures in constant time.
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { id: data.id, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

// Cookie settings. `secure` is controlled by COOKIE_SECURE because the first
// EC2 deployment uses plain HTTP (secure cookies only work over HTTPS).
function cookieOptions() {
  return {
    httpOnly: true, // JavaScript in the browser cannot read it
    sameSite: "lax", // not sent on cross-site POST requests (helps against CSRF)
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.COOKIE_SECURE === "true",
  };
}

export async function setSessionCookie(user) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user), cookieOptions());
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

// Returns { id, name, role } for the logged-in user, or null.
export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// ---------- Guards for PAGES (server components) ----------

// Any logged-in user. Sends logged-out visitors to /login.
export async function requireUser() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

// A specific role. Users with another role go to their own home page.
export async function requireRole(role) {
  const user = await requireUser();
  if (user.role !== role) redirect(ROLE_HOME[user.role] || "/login");
  return user;
}

// ---------- Guard for API ROUTES ----------

// Returns { user } if allowed, or { error: <401/403 response> } if not.
export async function requireApiRole(role) {
  const user = await getSession();
  if (!user) {
    return { error: NextResponse.json({ error: "Please log in first." }, { status: 401 }) };
  }
  if (user.role !== role) {
    return { error: NextResponse.json({ error: "You do not have permission to do this." }, { status: 403 }) };
  }
  return { user };
}
