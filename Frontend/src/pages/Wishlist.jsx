import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";

export default function Wishlist({ favorites = [], products = [], onOpenProduct, onToggleFavorite, t, language }) {
  const favSet = new Set(Array.isArray(favorites) ? favorites : []);
  const list = Array.isArray(products) ? products.filter((p) => favSet.has(String(p?.id))) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.wishlistTitle} subtitle={t.wishlistSubtitle} />

        {list.length === 0 ? (
          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.wishlistEmpty}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                onOpen={onOpenProduct}
                language={language}
                isFavorite
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}
