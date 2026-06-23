import Button from "./Button";

function getUtcDayNumber(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return Math.floor(Date.UTC(y, m, d) / 86400000);
}

export default function DailyVerseCard({ verses = [], t, notify }) {
  const list = Array.isArray(verses) ? verses : [];
  const day = getUtcDayNumber(new Date());
  const idx = list.length ? Math.abs(day) % list.length : 0;
  const verse = list[idx] || "";

  async function copy() {
    const text = String(verse || "").trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      if (typeof notify === "function") notify(t.toastCopied, "success");
    } catch {
      if (typeof notify === "function") notify(t.toastCopied, "success");
    }
  }

  return (
    <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-zinc-200/60 bg-white/55 px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm backdrop-blur-xl">
            {t.dailyVerseTitle}
          </div>
          <div className="mt-3 text-lg font-extrabold leading-7 text-zinc-900 md:text-xl">
            {verse}
          </div>
          <div className="mt-2 text-sm text-zinc-600">{t.dailyVerseSubtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={copy} disabled={!String(verse || "").trim()}>
            {t.dailyVerseCopy}
          </Button>
        </div>
      </div>
    </div>
  );
}
