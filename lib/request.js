// Basic CSRF protection: only accept POST/PATCH requests that come from
// our own site. Browsers always send the Origin header on these requests.
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host"); // Nginx must pass the Host header (see README)
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
