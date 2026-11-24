"use client";
// Top navigation bar (school blue): logo, links for the user's role, name, and Log out.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import Logo from "./Logo";
import SchoolStripe from "./SchoolStripe";
import Spinner from "./Spinner";

const LINKS = {
  [ROLES.REPORTER]: [
    { href: "/report", label: "Report an Issue" },
    { href: "/my-reports", label: "My Reports" },
  ],
  [ROLES.IT_SUPPORT]: [{ href: "/dashboard", label: "Dashboard" }],
};

// Focus ring that is visible on the blue background.
const focusOnBlue = "focus-visible:outline-gold-400";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const links = LINKS[user.role] || [];

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-20 bg-brand-900 text-white shadow-md">
      <SchoolStripe className="h-1" />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="LabFix home" className={`rounded-lg ${focusOnBlue}`}>
          <Logo variant="light" />
        </Link>

        {/* Desktop links: the active page gets a yellow underline */}
        <div className="hidden h-full items-stretch gap-1 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center px-3 text-sm font-semibold transition ${focusOnBlue} ${
                  active ? "text-white" : "text-brand-100 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-2 bottom-0 h-1 rounded-t-full transition ${active ? "bg-gold-400" : "bg-transparent"}`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gold-300 ring-1 ring-white/20">
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs font-medium text-gold-300">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            className={`inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:border-crimson-400 hover:bg-crimson-600 disabled:opacity-60 ${focusOnBlue}`}
          >
            {loggingOut && <Spinner />}
            Log out
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className={`rounded-lg p-2 text-white hover:bg-white/10 md:hidden ${focusOnBlue}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-brand-950 px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center gap-3 px-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gold-300 ring-1 ring-white/20">
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs font-medium text-gold-300">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg border-l-4 px-3 py-2.5 font-semibold ${focusOnBlue} ${
                  active ? "border-gold-400 bg-white/10 text-white" : "border-transparent text-brand-100 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            disabled={loggingOut}
            className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-semibold text-crimson-300 hover:bg-crimson-600 hover:text-white ${focusOnBlue}`}
          >
            {loggingOut && <Spinner />}
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
