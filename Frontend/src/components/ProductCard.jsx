import { l10n, money } from "../utils/format";
import Pill from "./Pill";

export default function ProductCard({
  p,
  onOpen,
  language,
  t,
  stockCount,
  ratingAvg,
  ratingCount,
  isFavorite = false,
  onToggleFavorite,
}) {
  const name = l10n(p?.name, language);
  const short = l10n(p?.short, language);

  const canFav = typeof onToggleFavorite === "function" && p?.id != null;

  const stockN = Number(stockCount);
  const lowStock = Number.isFinite(stockN) && stockN > 0 && stockN <= 3;

  const avg = Number(ratingAvg);
  const count = Number(ratingCount);
  const hasRatings = Number.isFinite(avg) && Number.isFinite(count) && count > 0;

  function open() {
    if (typeof onOpen === "function") onOpen(p);
  }

  function toggleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!canFav) return;
    onToggleFavorite(String(p.id));
  }

  const tags = Array.isArray(p?.tags) ? p.tags : [];

  return (
    <div className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-white text-left shadow-sm transition hover:bg-zinc-50">
      <div className="relative overflow-hidden">
        <button type="button" onClick={open} className="block w-full text-left">
          <img
            alt={name}
            src={p?.image}
            className="h-40 w-full object-cover transition group-hover:scale-[1.03]"
          />
        </button>

        {lowStock ? (
          <div className="absolute left-3 top-3 inline-flex items-center rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-[11px] font-extrabold text-zinc-900 shadow-sm">
            {typeof t?.lowStockLeft === "function"
              ? t.lowStockLeft(stockN)
              : language === "es"
              ? `Quedan ${stockN}`
              : `Only ${stockN} left`}
          </div>
        ) : null}

        {canFav ? (
          <button
            type="button"
            onClick={toggleFav}
            className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white ${
              isFavorite ? "text-zinc-900" : ""
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0L12 7.9 8.7 4.6c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5L12 21l8.8-10.9c1.5-1.5 1.5-4 0-5.5Z" />
            </svg>
          </button>
        ) : null}
      </div>

      <button type="button" onClick={open} className="block w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">{p?.category}</div>
            <div className="mt-1 text-sm font-bold text-zinc-900">{name}</div>
          </div>
          <div className="text-sm font-bold text-zinc-900">{money(p?.price, language)}</div>
        </div>
        <div className="mt-2 text-sm text-zinc-600">{short}</div>

        {hasRatings ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
            <StarRow value={avg} />
            <span className="font-semibold text-zinc-700">{avg.toFixed(1)}</span>
            <span className="text-zinc-500">({count})</span>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, idx) => {
            const key = `${l10n(tag, "en") || l10n(tag, "es") || "tag"}-${idx}`;
            return <Pill key={key}>{l10n(tag, language)}</Pill>;
          })}
        </div>
      </button>
    </div>
  );
}

function StarRow({ value }) {
  const v = Number(value);
  const safe = Number.isFinite(v) ? Math.max(0, Math.min(5, v)) : 0;
  const filled = Math.round(safe);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${safe.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < filled;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`h-4 w-4 ${on ? "text-zinc-800" : "text-zinc-300"}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 17.3 18.2 21l-1.7-7.1L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2l5.5 4.7L5.8 21 12 17.3Z" />
          </svg>
        );
      })}
    </span>
  );
}
