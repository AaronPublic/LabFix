// Shows the report photo. For now there is no real photo, so we show a
// placeholder box. Later, getPhotoUrl() in lib/storage.js will return an
// S3 pre-signed URL and the real image will be shown.
export default function PhotoPlaceholder({ photoUrl, photoKey }) {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt="Photo of the reported problem" className="w-full rounded-xl border border-slate-200 object-contain" />
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
      </span>
      <p className="font-bold text-brand-900">Photo will load from Amazon S3</p>
      {photoKey && <p className="mt-1 font-mono text-xs break-all text-slate-500">{photoKey}</p>}
    </div>
  );
}
