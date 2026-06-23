export default function ToastStack({ toasts = [], onDismiss }) {
  if (!Array.isArray(toasts) || toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 md:inset-x-auto md:right-4 md:justify-end">
      <div className="grid w-full max-w-md gap-2 md:w-[420px]">
        {toasts.map((t) => {
          const tone = t?.tone === "danger" ? "danger" : t?.tone === "info" ? "info" : "success";
          const styles =
            tone === "danger"
              ? "border-red-200 bg-white text-red-900"
              : tone === "info"
              ? "border-sky-200 bg-white text-sky-900"
              : "border-emerald-200 bg-white text-emerald-900";

          const iconBg =
            tone === "danger" ? "bg-red-100" : tone === "info" ? "bg-sky-100" : "bg-emerald-100";

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-[22px] border px-4 py-3 shadow-xl ${styles}`}
              style={{ animation: "gbfToastIn 180ms ease-out" }}
              role="status"
              aria-live="polite"
            >
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  {tone === "danger" ? <path d="M12 9v4m0 4h.01M10.3 3.5h3.4L22 21H2L10.3 3.5Z" /> : null}
                  {tone === "info" ? <path d="M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : null}
                  {tone === "success" ? <path d="M20 6L9 17l-5-5" /> : null}
                </svg>
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold leading-5">
                  {String(t?.message || "")}
                </div>
              </div>

              {typeof onDismiss === "function" ? (
                <button
                  type="button"
                  className="-mr-1 rounded-full px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                  onClick={() => onDismiss(t.id)}
                  aria-label="Close"
                >
                  ×
                </button>
              ) : null}

              <style>{`@keyframes gbfToastIn { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}
