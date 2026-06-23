import { l10n, money } from "../utils/format";
import Pill from "./Pill";

export default function ProductCard({
  p,
  onOpen,
  language,
  isFavorite = false,
  onToggleFavorite,
}) {
  const name = l10n(p?.name, language);
  const short = l10n(p?.short, language);

  const canFav = typeof onToggleFavorite === "function" && p?.id != null;

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
    <div className="group overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white/55 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70">
      <div className="relative overflow-hidden">
        <button type="button" onClick={open} className="block w-full text-left">
          <img
            alt={name}
            src={p?.image}
            className="h-40 w-full object-cover transition group-hover:scale-[1.03]"
          />
        </button>

        {canFav ? (
          <button
            type="button"
            onClick={toggleFav}
            className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-xl transition ${
              isFavorite
                ? "border-rose-200 bg-white/70 text-rose-600"
                : "border-zinc-200 bg-white/60 text-zinc-700 hover:bg-white/80"
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
