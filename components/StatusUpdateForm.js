"use client";
// IT Support form to change a report's status. Sends PATCH /api/reports/[id].
import { useRouter } from "next/navigation";
import { useState } from "react";
import { REMARKS_MAX, STATUSES, STATUS_LIST } from "@/lib/constants";
import Alert from "./Alert";
import SubmitButton from "./SubmitButton";

// Selected color for each status choice (school colors).
const SELECTED = {
  [STATUSES.PENDING]: "border-crimson-600 bg-crimson-600 text-white",
  [STATUSES.IN_PROGRESS]: "border-gold-400 bg-gold-400 text-brand-950",
  [STATUSES.RESOLVED]: "border-brand-700 bg-brand-700 text-white",
};

export default function StatusUpdateForm({ reportId, currentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (status === currentStatus && !remarks.trim()) {
      setError("Choose a different status or add a remark.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks: remarks.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldMessage = data.fields ? Object.values(data.fields)[0] : "";
        setError(fieldMessage || data.error || "Could not update the status. Please try again.");
      } else {
        setSuccess(`Status updated to "${data.report.status}".`);
        setRemarks("");
        router.refresh(); // reload the server data (badge + timeline)
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      {/* Status choices: Pending -> In Progress -> Resolved */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-brand-950">New status</legend>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_LIST.map((s) => (
            <label
              key={s}
              className={`cursor-pointer rounded-lg border-2 px-2 py-2 text-center text-sm font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2 ${
                status === s ? SELECTED[s] : "border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="remarks" className="text-sm font-semibold text-brand-950">
            Remarks <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <span className="text-xs text-slate-500">
            {remarks.length}/{REMARKS_MAX}
          </span>
        </div>
        <textarea
          id="remarks"
          rows={3}
          maxLength={REMARKS_MAX}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Replaced the power supply."
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none"
        />
      </div>

      <SubmitButton loading={loading} loadingText="Saving..." className="w-full">
        Update Status
      </SubmitButton>
    </form>
  );
}
