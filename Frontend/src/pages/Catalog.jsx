import { useMemo, useState } from "react";
import { l10n } from "../utils/format";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";

export default function Catalog({
  products = [],
  categories = [],
  favorites = [],
  stockById,
  ratingSummaryById,
  onToggleFavorite,
  onOpenProduct,
  t,
  language,
}) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCat = category === "All" ? true : p.category === category;
      const haystack = `${l10n(p.name, language)} ${l10n(p.short, language)}`.toLowerCase();
      const byQ = q.trim().length === 0 ? true : haystack.includes(q.trim().toLowerCase());
      return byCat && byQ;
    });
  }, [category, q, products, language]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#F8F6F2]/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.catalogTitle} subtitle={t.catalogSubtitle} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={category === "All"} onClick={() => setCategory("All")}>
              {t.all}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-2xl border border-[#DDD6CA] bg-white px-4 py-2 text-sm outline-none focus:border-[#355E3B] md:w-72"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onOpen={onOpenProduct}
            language={language}
            t={t}
            stockCount={stockById?.[p.id]}
            ratingAvg={ratingSummaryById?.[String(p.id)]?.avg}
            ratingCount={ratingSummaryById?.[String(p.id)]?.count}
            isFavorite={Array.isArray(favorites) ? favorites.includes(String(p.id)) : false}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      <Footer t={t} />
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#355E3B] text-white"
          : "border border-[#DDD6CA]/70 bg-white/60 text-[#2B2B2B] hover:bg-[#EFE7DA]/60"
      }`}
    >
      {children}
    </button>
  );
}
