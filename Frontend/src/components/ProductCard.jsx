import { l10n, money } from "../utils/format";
import Pill from "./Pill";

export default function ProductCard({ p, onOpen, language }) {
  const name = l10n(p.name, language);
  const short = l10n(p.short, language);

  return (
    <button
      onClick={() => onOpen(p)}
      className="group overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white/55 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70"
    >
      <div className="overflow-hidden">
        <img
          alt={name}
          src={p.image}
          className="h-40 w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">{p.category}</div>
            <div className="mt-1 text-sm font-bold text-zinc-900">{name}</div>
          </div>
          <div className="text-sm font-bold text-zinc-900">{money(p.price, language)}</div>
        </div>
        <div className="mt-2 text-sm text-zinc-600">{short}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.map((tag, idx) => {
            const key = `${l10n(tag, "en") || l10n(tag, "es") || "tag"}-${idx}`;
            return <Pill key={key}>{l10n(tag, language)}</Pill>;
          })}
        </div>
      </div>
    </button>
  );
}
