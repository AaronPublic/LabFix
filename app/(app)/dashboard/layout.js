// Every /dashboard page is for IT Support only.
// The check runs here (before loading.js starts streaming) so wrong-role
// users get a real redirect. Each page also checks again, to be safe.
import { ROLES } from "@/lib/constants";
import { requireRole } from "@/lib/session";

export default async function DashboardLayout({ children }) {
  await requireRole(ROLES.IT_SUPPORT);
  return children;
}
