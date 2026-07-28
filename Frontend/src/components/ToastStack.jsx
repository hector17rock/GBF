export default function ToastStack({ toasts = [], onDismiss }) {
  if (!Array.isArray(toasts) || toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pointer-events-none">
      <div className="grid w-full max-w-md gap-3 md:w-[440px]">
        {toasts.map((t) => {
          const tone = t?.tone === "danger" ? "danger" : t?.tone === "info" ? "info" : "success";

          // UX: keep the icon language simple.
          // - success/info => checkmark
          // - danger => X
          const isError = tone === "danger";

          const iconTone = isError ? "text-red-700" : "text-emerald-700";

          // Neutral icon surface (no green/red background tints in the toast itself).
          const iconSurface = "bg-white/55 border border-white/60 shadow-sm";

          return (
            <div
              key={t.id}
              className="relative pointer-events-auto overflow-hidden rounded-[26px] border border-white/35 bg-white/20 px-6 py-6 shadow-2xl backdrop-blur-2xl backdrop-saturate-150"
              style={{
                animation: "gbfToastIn 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                // Extra-translucent glass across browsers (Safari needs -webkit- prefix).
                WebkitBackdropFilter: "blur(34px) saturate(190%)",
                backdropFilter: "blur(34px) saturate(190%)",
              }}
              role="status"
              aria-live="polite"
            >
              {/* Glass highlight (very subtle so it stays translucent) */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-white/0"
                aria-hidden="true"
              />

              {/* Light frost grain */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
                aria-hidden="true"
              />
              {typeof onDismiss === "function" ? (
                <button
                  type="button"
                  className="absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-white/25"
                  onClick={() => onDismiss(t.id)}
                  aria-label="Close"
                >
                  ×
                </button>
              ) : null}

              <div className="relative z-10 flex min-h-[170px] flex-col items-center justify-center text-center">
                {/* Icon slot: spinner and final icon are aligned to the exact same position */}
                <div className="relative h-16 w-16">
                  <div className="gbfToastLoader absolute inset-0 grid place-items-center" aria-hidden="true">
                    <div className="gbfToastSpinner" />
                  </div>

                  <div
                    className={`gbfToastFinalIcon absolute inset-0 inline-flex items-center justify-center rounded-full ${iconSurface} ${iconTone}`}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9"
                    >
                    {isError ? (
                      <>
                        <path className="gbfToastIconPath" d="M6 6l12 12" />
                        <path className="gbfToastIconPath" d="M18 6L6 18" />
                      </>
                    ) : (
                      <path className="gbfToastIconPath" d="M20 6L9 17l-5-5" />
                    )}
                    </svg>
                  </div>
                </div>

                <div className="mt-4 text-[15px] font-extrabold leading-6 text-[#2B2B2B]">
                  {String(t?.message || "")}
                </div>
              </div>

              <style>{`
                /* Toast entrance */
                @keyframes gbfToastIn {
                  from { transform: translateY(10px) scale(0.985); opacity: 0 }
                  to { transform: translateY(0) scale(1); opacity: 1 }
                }

                /* Loading → icon sequence */
                @keyframes gbfToastLoaderIn {
                  0% { opacity: 0; transform: scale(0.95) }
                  100% { opacity: 1; transform: scale(1) }
                }
                @keyframes gbfToastLoaderOut {
                  0% { opacity: 1; transform: scale(1) }
                  100% { opacity: 0; transform: scale(0.92) }
                }
                @keyframes gbfToastIconIn {
                  0% { opacity: 0; transform: scale(0.7) }
                  70% { opacity: 1; transform: scale(1.06) }
                  100% { opacity: 1; transform: scale(1) }
                }

                .gbfToastLoader {
                  animation: gbfToastLoaderIn 160ms ease-out both, gbfToastLoaderOut 220ms ease-in 900ms both;
                }

                .gbfToastSpinner {
                  width: 44px;
                  height: 44px;
                  border-radius: 9999px;
                  border: 3px solid rgba(43, 43, 43, 0.18);
                  border-top-color: rgba(43, 43, 43, 0.65);
                  animation: gbfToastSpin 700ms linear infinite;
                }

                @keyframes gbfToastSpin {
                  to { transform: rotate(360deg) }
                }

                .gbfToastFinalIcon {
                  opacity: 0;
                  transform: scale(0.7);
                  animation: gbfToastIconIn 260ms cubic-bezier(0.22, 1, 0.36, 1) 920ms both;
                }

                /* Icon draw (slower so it’s visible) */
                @keyframes gbfToastStrokeIn {
                  from { stroke-dashoffset: 180 }
                  to { stroke-dashoffset: 0 }
                }

                .gbfToastFinalIcon .gbfToastIconPath {
                  stroke-dasharray: 180;
                  stroke-dashoffset: 180;
                  animation: gbfToastStrokeIn 1800ms ease-out 980ms both;
                }

                @media (prefers-reduced-motion: reduce) {
                  .gbfToastLoader { animation: none !important; opacity: 0; }
                  .gbfToastSpinner { animation: none !important; }
                  .gbfToastFinalIcon { animation: none !important; opacity: 1; transform: none; }
                  .gbfToastFinalIcon .gbfToastIconPath { animation: none !important; stroke-dashoffset: 0; }
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}
