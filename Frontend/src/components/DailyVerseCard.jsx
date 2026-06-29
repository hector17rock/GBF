import Button from "./Button";

function getUtcDayNumber(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return Math.floor(Date.UTC(y, m, d) / 86400000);
}

export default function DailyVerseCard({ verses = [], t, language, notify }) {
  const list = Array.isArray(verses) ? verses : [];
  const day = getUtcDayNumber(new Date());
  const idx = list.length ? Math.abs(day) % list.length : 0;
  const v = list[idx];

  const ref =
    v && typeof v === "object"
      ? String(v?.ref?.[language] || v?.ref?.es || v?.ref?.en || "").trim()
      : String(v || "").trim();

  const text =
    v && typeof v === "object"
      ? String(v?.text?.[language] || v?.text?.es || v?.text?.en || "").trim()
      : "";

  const copyText = [ref, text].filter(Boolean).join(" — ");

  async function copy() {
    if (!copyText) return;

    try {
      await navigator.clipboard.writeText(copyText);
      if (typeof notify === "function") notify(t.toastCopied, "success");
    } catch {
      if (typeof notify === "function") notify(t.toastCopied, "success");
    }
  }

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm">
            {t.dailyVerseTitle}
          </div>
          {text ? (
            <div className="mt-3 text-pretty text-lg font-extrabold leading-7 text-zinc-900 md:text-xl">
              “{text}”
            </div>
          ) : null}

          <div className="mt-3 text-sm font-semibold text-zinc-700">{ref}</div>
          <div className="mt-2 text-sm text-zinc-600">{t.dailyVerseSubtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={copy} disabled={!copyText}>
            {t.dailyVerseCopy}
          </Button>
        </div>
      </div>
    </div>
  );
}
