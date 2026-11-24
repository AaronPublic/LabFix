// Simple in-memory login rate limit: 5 attempts per 15 minutes per IP + email.
// Note: memory resets when the server restarts, and it only works for ONE
// server process. That is fine for a single EC2 instance.
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "./constants";

if (!globalThis.__labfixLoginAttempts) {
  globalThis.__labfixLoginAttempts = new Map();
}
const attempts = globalThis.__labfixLoginAttempts; // key -> { count, start }

// Get the visitor's IP. Behind Nginx, the real IP is in X-Forwarded-For.
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// Remove old entries so the Map does not grow forever.
function cleanup(now) {
  for (const [key, entry] of attempts) {
    if (now - entry.start > LOGIN_WINDOW_MS) attempts.delete(key);
  }
}

// Records one attempt. Returns true if this attempt is still allowed.
export function checkLoginAttempt(key) {
  const now = Date.now();
  cleanup(now);

  const entry = attempts.get(key);
  if (!entry) {
    attempts.set(key, { count: 1, start: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= LOGIN_MAX_ATTEMPTS;
}

// Called after a successful login.
export function clearLoginAttempts(key) {
  attempts.delete(key);
}
