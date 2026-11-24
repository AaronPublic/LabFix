"use client";
// Email + password form. Sends the data to POST /api/auth/login.
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "./Alert";
import SubmitButton from "./SubmitButton";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }
      router.replace(data.redirectTo || "/");
      router.refresh();
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-brand-950">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-brand-950">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-bold text-brand-700 hover:text-brand-900"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <SubmitButton loading={loading} loadingText="Logging in..." className="w-full">
        Log in
      </SubmitButton>
    </form>
  );
}
