"use client";
// The "Report an Issue" form. Sends multipart form data to POST /api/reports.
// The browser checks here are only for convenience. The server checks everything again.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ALLOWED_PHOTO_TYPES,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  ISSUE_TYPES,
  MAX_PHOTO_BYTES,
} from "@/lib/constants";
import Alert from "./Alert";
import SchoolStripe from "./SchoolStripe";
import SubmitButton from "./SubmitButton";

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-crimson-700">{message}</p>;
}

function Required() {
  return <span className="text-crimson-600">*</span>;
}

// Numbered section heading: a yellow circle with a blue number.
function Step({ number, title, hint, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-extrabold text-brand-950">
          {number}
        </span>
        <div>
          <h2 className="font-bold text-brand-950">{title}</h2>
          {hint && <p className="text-sm text-slate-500">{hint}</p>}
        </div>
      </div>
      <div className="sm:pl-10">{children}</div>
    </section>
  );
}

export default function ReportForm({ labs }) {
  const [labId, setLabId] = useState("");
  const [pcNumber, setPcNumber] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const fileInput = useRef(null);

  // Free the preview image memory when the photo changes.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    setErrors((e) => ({ ...e, photo: "" }));
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, photo: "Only JPEG, PNG, or WEBP photos are allowed." }));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((e) => ({ ...e, photo: "Photo is too large. The maximum size is 5 MB." }));
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhoto(null);
    setPreviewUrl("");
    if (fileInput.current) fileInput.current.value = "";
  }

  // Quick checks before sending (same rules as lib/validation.js).
  function checkForm() {
    const found = {};
    if (!labId) found.labId = "Please choose a lab.";
    if (!/^[A-Za-z0-9-]{1,10}$/.test(pcNumber.trim())) {
      found.pcNumber = "Use letters, numbers, and dashes only (max 10), e.g. PC-12.";
    }
    if (!issueType) found.issueType = "Please choose an issue type.";
    const len = description.trim().length;
    if (len < DESCRIPTION_MIN || len > DESCRIPTION_MAX) {
      found.description = `Description must be ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} characters.`;
    }
    if (!photo) found.photo = "Please attach a photo of the problem.";
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const found = checkForm();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    const formData = new FormData();
    formData.append("labId", labId);
    formData.append("pcNumber", pcNumber.trim());
    formData.append("issueType", issueType);
    formData.append("description", description.trim());
    formData.append("photo", photo);

    setLoading(true);
    try {
      const res = await fetch("/api/reports", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setFormError("Your session has expired. Please log in again.");
      } else if (res.status === 413) {
        setErrors({ photo: "Photo is too large. The maximum size is 5 MB." });
        setFormError("Please fix the highlighted fields.");
      } else if (!res.ok) {
        setErrors(data.fields || {});
        setFormError(data.error || "Could not submit the report. Please try again.");
      } else {
        setSubmittedId(data.id);
      }
    } catch {
      setFormError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setLabId("");
    setPcNumber("");
    setIssueType("");
    setDescription("");
    removePhoto();
    setErrors({});
    setFormError("");
    setSubmittedId("");
  }

  // ----- Success screen -----
  if (submittedId) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
        <SchoolStripe className="h-1.5" />
        <div className="p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-brand-950 ring-8 ring-gold-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-8 w-8" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-950">Report submitted!</h2>
          <p className="mt-2 text-slate-600">Thank you. IT Support has been notified.</p>
          <div className="mx-auto mt-5 inline-block rounded-xl border border-brand-100 bg-brand-50 px-6 py-3">
            <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">Your report ID</p>
            <p className="font-mono text-2xl font-extrabold text-brand-900">{submittedId}</p>
          </div>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={startOver}
              className="rounded-lg border-2 border-brand-200 px-4 py-2.5 font-bold text-brand-800 hover:bg-brand-50"
            >
              Submit another
            </button>
            <Link href="/my-reports" className="rounded-lg bg-brand-700 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-brand-800">
              View my reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----- The form -----
  const border = (field) => (errors[field] ? "border-crimson-400 bg-crimson-50/40" : "border-slate-300");
  const descLength = description.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SchoolStripe className="h-1.5" />
      <div className="space-y-8 p-5 sm:p-8">
        <Alert type="error">{formError}</Alert>

        {/* Step 1: where */}
        <Step number="1" title="Where is the computer?" hint="Choose the lab and type the number on the PC's label.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="labId" className="mb-1 block text-sm font-semibold text-brand-950">
                Lab <Required />
              </label>
              <select id="labId" value={labId} onChange={(e) => setLabId(e.target.value)} className={`${inputClass} ${border("labId")}`}>
                <option value="">Select a lab</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} ({lab.building})
                  </option>
                ))}
              </select>
              <FieldError message={errors.labId} />
            </div>

            <div>
              <label htmlFor="pcNumber" className="mb-1 block text-sm font-semibold text-brand-950">
                PC Number <Required />
              </label>
              <input
                id="pcNumber"
                type="text"
                maxLength={10}
                value={pcNumber}
                onChange={(e) => setPcNumber(e.target.value.toUpperCase())}
                placeholder="e.g. PC-12"
                autoCapitalize="characters"
                className={`${inputClass} ${border("pcNumber")}`}
              />
              <FieldError message={errors.pcNumber} />
            </div>
          </div>
        </Step>

        {/* Step 2: what */}
        <Step number="2" title="What is the problem?">
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-brand-950">
              Issue Type <Required />
            </legend>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TYPES.map((type) => {
                const selected = issueType === type;
                return (
                  <label
                    key={type}
                    className={`cursor-pointer select-none rounded-full border-2 px-4 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2 ${
                      selected
                        ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-gold-400 hover:bg-gold-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={type}
                      checked={selected}
                      onChange={() => setIssueType(type)}
                      className="sr-only"
                    />
                    {type}
                  </label>
                );
              })}
            </div>
            <FieldError message={errors.issueType} />
          </fieldset>

          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="description" className="block text-sm font-semibold text-brand-950">
                Description <Required />
              </label>
              <span className={`text-xs font-medium ${descLength > DESCRIPTION_MAX ? "text-crimson-700" : "text-slate-500"}`}>
                {descLength}/{DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              id="description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? For example: the monitor stays black even when the PC is on."
              className={`${inputClass} ${border("description")} resize-y`}
            />
            <FieldError message={errors.description} />
          </div>
        </Step>

        {/* Step 3: photo */}
        <Step number="3" title="Add a photo" hint="A clear photo helps IT Support fix it faster.">
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img src={previewUrl} alt="Preview of the selected photo" className="mx-auto max-h-72 w-auto object-contain" />
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2 text-sm">
                <span className="truncate text-slate-600">
                  {photo.name} · {(photo.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button type="button" onClick={removePhoto} className="font-bold text-crimson-700 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition hover:border-gold-400 hover:bg-gold-50 ${
                errors.photo ? "border-crimson-300 bg-crimson-50" : "border-brand-200 bg-brand-50/50"
              }`}
            >
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <path d="M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </span>
              <span className="font-bold text-brand-800">
                Take or choose a photo <Required />
              </span>
              <span className="mt-1 text-xs text-slate-500">JPEG, PNG, or WEBP · max 5 MB</span>
            </label>
          )}
          <input
            ref={fileInput}
            id="photo"
            type="file"
            accept={ALLOWED_PHOTO_TYPES.join(",")}
            onChange={choosePhoto}
            className="sr-only"
          />
          <FieldError message={errors.photo} />
        </Step>
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:px-8">
        <p className="text-xs text-slate-500">
          Fields marked <Required /> are required.
        </p>
        <SubmitButton loading={loading} loadingText="Submitting..." variant="accent" className="w-full sm:w-auto">
          Submit Report
        </SubmitButton>
      </div>
    </form>
  );
}
