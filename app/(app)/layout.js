// Layout for all logged-in pages: checks the session and shows the navbar.
import Navbar from "@/components/Navbar";
import SchoolStripe from "@/components/SchoolStripe";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }) {
  const user = await requireUser(); // redirects to /login if logged out

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="bg-white">
        <SchoolStripe className="h-1" />
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-500">
          <span className="font-bold text-brand-900">LabFix</span> · Computer Laboratory Issue Reporting System
        </p>
      </footer>
    </div>
  );
}
