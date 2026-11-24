import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import Logo from "@/components/Logo";
import SchoolStripe from "@/components/SchoolStripe";
import { ROLE_HOME } from "@/lib/constants";
import { getSession } from "@/lib/session";

export const metadata = { title: "Log in · LabFix" };

// Demo accounts are shown ONLY in development, never in production.
const DEMO_ACCOUNTS = [
  { role: "Reporter (student/faculty)", email: "reporter@labfix.edu", password: "Reporter123!" },
  { role: "IT Support", email: "itsupport@labfix.edu", password: "Support123!" },
];

const STEPS = [
  { title: "Snap a photo", text: "Take a picture of the broken computer." },
  { title: "Tell us where", text: "Pick the lab and the PC number." },
  { title: "Track the fix", text: "Follow it from Pending to Resolved." },
];

export default async function LoginPage() {
  // Already logged in? Go to your home page.
  const user = await getSession();
  if (user) redirect(ROLE_HOME[user.role] || "/");

  const showDemo = process.env.NODE_ENV !== "production";

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: school-blue welcome panel (top banner on phones) */}
      <section className="relative overflow-hidden bg-brand-900 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <SchoolStripe className="h-1.5" />
        {/* Decorative circles in the school colors */}
        <span className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold-400/15" aria-hidden="true" />
        <span className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-crimson-600/20" aria-hidden="true" />

        <div className="relative px-6 py-8 sm:px-10 lg:py-12">
          <Logo variant="light" />
          <h1 className="mt-6 max-w-md text-2xl leading-tight font-extrabold sm:text-3xl lg:mt-16 lg:text-4xl">
            Spotted a broken computer? <span className="text-gold-400">Report it in a minute.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-brand-100 sm:text-base">
            The Computer Laboratory Issue Reporting System helps IT Support keep every lab PC working.
          </p>
        </div>

        <ol className="relative hidden space-y-5 px-10 pb-12 lg:block">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400 font-extrabold text-brand-950">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{step.title}</p>
                <p className="text-sm text-brand-100">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Right: login card on white */}
      <section className="flex flex-1 items-center justify-center bg-white px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <span className="mb-3 block h-1 w-10 rounded-full bg-crimson-600" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold text-brand-950">Welcome back</h2>
          <p className="mt-1 mb-6 text-sm text-slate-600">Log in with your university account.</p>
          <LoginForm />

          {showDemo && (
            <div className="mt-8 rounded-xl border border-gold-300 bg-gold-50 p-4 text-sm">
              <p className="mb-2 font-bold text-gold-900">Demo accounts (development only)</p>
              <ul className="space-y-2 text-gold-900">
                {DEMO_ACCOUNTS.map((acc) => (
                  <li key={acc.email}>
                    <span className="font-semibold">{acc.role}:</span>{" "}
                    <code className="rounded bg-white px-1">{acc.email}</code> /{" "}
                    <code className="rounded bg-white px-1">{acc.password}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
