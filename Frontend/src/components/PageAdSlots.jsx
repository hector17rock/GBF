import { useEffect, useRef } from "react";

const GOOGLE_ADSENSE_CLIENT = String(import.meta?.env?.VITE_GOOGLE_ADSENSE_CLIENT || "").trim();
const GOOGLE_ADSENSE_SLOT_LEFT = String(
  import.meta?.env?.VITE_GOOGLE_ADSENSE_SLOT_LEFT || import.meta?.env?.VITE_GOOGLE_ADSENSE_HOME_SLOT_LEFT || ""
).trim();
const GOOGLE_ADSENSE_SLOT_RIGHT = String(
  import.meta?.env?.VITE_GOOGLE_ADSENSE_SLOT_RIGHT || import.meta?.env?.VITE_GOOGLE_ADSENSE_HOME_SLOT_RIGHT || ""
).trim();

function ensureGoogleAdsenseScript(clientId) {
  if (typeof document === "undefined" || !clientId) return;

  const existing = document.querySelector(
    "script[data-gbf-adsense-script='true'], script[src*='pagead2.googlesyndication.com/pagead/js/adsbygoogle.js']"
  );
  if (existing) return;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    clientId
  )}`;
  script.setAttribute("data-gbf-adsense-script", "true");
  document.head.appendChild(script);
}

function PageAdCard({ t, slotId }) {
  const adInitializedRef = useRef(false);
  const canRenderGoogleAd = Boolean(GOOGLE_ADSENSE_CLIENT && slotId);

  useEffect(() => {
    if (!canRenderGoogleAd) return;
    ensureGoogleAdsenseScript(GOOGLE_ADSENSE_CLIENT);
  }, [canRenderGoogleAd]);

  useEffect(() => {
    if (!canRenderGoogleAd || adInitializedRef.current || typeof window === "undefined") return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      adInitializedRef.current = true;
    } catch {
      // Keep the reserved slot visible while the AdSense script finishes loading.
    }
  }, [canRenderGoogleAd, slotId]);

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t.homeAdLabel}
        </div>
        <div className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold text-zinc-600">
          Google Ads
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50/80 p-4">
        {canRenderGoogleAd ? (
          <div className="min-h-[180px]">
            <ins
              className="adsbygoogle block min-h-[180px] w-full"
              style={{ display: "block" }}
              data-ad-client={GOOGLE_ADSENSE_CLIENT}
              data-ad-slot={slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="grid min-h-[180px] place-items-center text-center">
            <div>
              <div className="text-sm font-bold text-zinc-900">{t.homeAdTitle}</div>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">{t.homeAdBody}</p>
              <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-500 shadow-sm">
                {t.homeAdSetupHint}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageAdSlots({ t, className = "" }) {
  const classes = className ? `${className} grid gap-4 md:grid-cols-2` : "grid gap-4 md:grid-cols-2";

  return (
    <div className={classes}>
      <PageAdCard t={t} slotId={GOOGLE_ADSENSE_SLOT_LEFT} />
      <PageAdCard t={t} slotId={GOOGLE_ADSENSE_SLOT_RIGHT} />
    </div>
  );
}
