import Link from "next/link";
import Logo from "@/components/Logo";
import SchoolStripe from "@/components/SchoolStripe";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <SchoolStripe className="h-1.5" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <Logo />
        <p className="text-7xl font-extrabold tracking-tight text-brand-900">
          4<span className="text-gold-500">0</span>
          <span className="text-crimson-600">4</span>
        </p>
        <h1 className="text-2xl font-extrabold text-brand-950">Page not found</h1>
        <p className="text-slate-600">The page or report you are looking for does not exist.</p>
        <Link href="/" className="rounded-lg bg-brand-700 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-brand-800">
          Go to home
        </Link>
      </div>
    </main>
  );
}
