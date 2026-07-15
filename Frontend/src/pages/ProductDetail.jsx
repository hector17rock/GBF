import { useMemo, useState } from "react";
import { COLORS, FONTS, VERSES } from "../data/catalog";
import Button from "../components/Button";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import { l10n, money } from "../utils/format";

export default function ProductDetail({
  product,
  products = [],
  favorites = [],
  onToggleFavorite,
  onOpenProduct,
  stockById,
  ratingSummaryById,
  reviews = [],
  onAddReview,
  notify,
  onBack,
  onAddToCart,
  onGoCheckout,
  t,
  language,
}) {
  const [text, setText] = useState("");
  const [verse, setVerse] = useState(VERSES[1]);
  const [font, setFont] = useState(FONTS[0].id);
  const [color, setColor] = useState(COLORS[0].id);

  const stockN = Number(stockById?.[product?.id]);
  const lowStock = Number.isFinite(stockN) && stockN > 0 && stockN <= 3;

  const rating = ratingSummaryById?.[String(product?.id)];
  const avg = Number(rating?.avg);
  const count = Number(rating?.count);
  const hasRatings = Number.isFinite(avg) && Number.isFinite(count) && count > 0;

  const canFav = typeof onToggleFavorite === "function" && product?.id != null;
  const isFavorite = Array.isArray(favorites) ? favorites.includes(String(product?.id)) : false;

  const related = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const id = String(product?.id ?? "");
    const cat = String(product?.category ?? "");

    return list
      .filter((p) => String(p?.id ?? "") !== id)
      .filter((p) => (cat ? String(p?.category ?? "") === cat : true))
      .slice(0, 4);
  }, [products, product]);

  const reviewRows = Array.isArray(reviews) ? reviews : [];

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");

  function submitReview(e) {
    e.preventDefault();
    setReviewError("");

    const ratingN = Math.round(Number(reviewRating));
    const safeRating = Number.isFinite(ratingN) ? Math.max(1, Math.min(5, ratingN)) : 0;
    const safeText = String(reviewText || "").trim();

    if (!safeRating || safeText.length < 3) {
      setReviewError(t.reviewInvalid);
      if (typeof notify === "function") notify(t.reviewInvalid, "danger");
      return;
    }

    if (typeof onAddReview === "function") {
      onAddReview({ productId: product?.id, rating: safeRating, name: reviewName, text: safeText });
      setReviewText("");
      setReviewName("");
      setReviewRating(5);
    }
  }

  const fontClass = FONTS.find((f) => f.id === font)?.className ?? "font-sans";

  const colorClass =
    color === "gold"
      ? "text-amber-500"
      : color === "sage"
      ? "text-emerald-600"
      : color === "sky"
      ? "text-sky-600"
      : color === "rose"
      ? "text-rose-600"
      : "text-zinc-900";

  const personalization = {
    text: text.trim(),
    verse,
    font,
    color,
  };

  const previewText = personalization.text.length > 0 ? personalization.text : t.previewFallbackText;
  const previewTextLen = previewText.length;

  const previewTextSizeClass =
    previewTextLen <= 14
      ? "text-3xl md:text-4xl"
      : previewTextLen <= 26
      ? "text-2xl md:text-3xl"
      : previewTextLen <= 42
      ? "text-xl md:text-2xl"
      : "text-lg md:text-xl";

  const previewTextLeadingClass = previewTextLen <= 26 ? "leading-tight" : "leading-snug";

  const gallery = useMemo(() => {
    const base = String(product?.image || "").trim();
    const list = [];

    if (base) list.push({ id: "main", kind: "preview", src: base });
    // If we ever add product.images[] in the catalog, we can render them here.
    const extra = Array.isArray(product?.images) ? product.images : [];
    for (let i = 0; i < extra.length; i++) {
      const src = String(extra[i] || "").trim();
      if (!src) continue;
      list.push({ id: `img-${i}`, kind: "plain", src });
    }

    return list.length ? list : [{ id: "main", kind: "preview", src: "" }];
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);

  const previewIndex = useMemo(() => {
    const idx = gallery.findIndex((g) => g?.kind === "preview");
    return idx >= 0 ? idx : 0;
  }, [gallery]);

  function ensurePreviewActive() {
    if (activeImg === previewIndex) return;
    setActiveImg(previewIndex);
  }

  function goPrev() {
    setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
  }

  function goNext() {
    setActiveImg((i) => (i + 1) % gallery.length);
  }

  const active = gallery[Math.max(0, Math.min(activeImg, gallery.length - 1))];

  function handleAddToCart() {
    if (typeof onAddToCart !== "function") return;
    onAddToCart(product, personalization);
  }

  function handleCheckout() {
    handleAddToCart();
    if (typeof onGoCheckout === "function") onGoCheckout();
  }

  const desc = l10n(product?.description, language);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.back}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {canFav ? (
              <button
                type="button"
                onClick={() => onToggleFavorite(String(product.id))}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition ${
                  isFavorite
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
                aria-label={isFavorite ? t.favRemove : t.favAdd}
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

            <div className="text-lg font-bold text-zinc-900">{money(product.price, language)}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Left: gallery */}
          <div className="grid gap-4 lg:grid-cols-[76px_1fr]">
            <div className="order-2 flex gap-2 overflow-auto lg:order-1 lg:flex-col">
              {gallery.map((g, idx) => {
                const selected = idx === activeImg;
                const label = language === "es" ? `Imagen ${idx + 1}` : `Image ${idx + 1}`;

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border transition ${
                      selected ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                    }`}
                    aria-label={label}
                    title={label}
                  >
                    {g.src ? (
                      <img src={g.src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-zinc-100" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="order-1 overflow-hidden rounded-[28px] border border-zinc-200 bg-white lg:order-2">
              <div className="relative">
                {active?.src ? (
                  <img
                    alt={l10n(product.name, language)}
                    src={active.src}
                    className="h-[420px] w-full object-cover md:h-[520px]"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div className="h-[420px] w-full bg-zinc-100 md:h-[520px]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Preview overlay */}
                {active?.kind === "preview" ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                    <div className="w-full max-w-[92%] text-center">
                      <div className="inline-flex items-center rounded-full border border-white/60 bg-white/55 px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm backdrop-blur-xl">
                        {t.preview}
                      </div>

                      <div
                        className={`mx-auto mt-4 max-w-[520px] text-balance font-extrabold ${previewTextSizeClass} ${previewTextLeadingClass} ${fontClass} ${colorClass} opacity-90`}
                        style={{
                          mixBlendMode: "multiply",
                          textShadow:
                            "0 1px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.22), 0 10px 22px rgba(0,0,0,0.25)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {previewText}
                      </div>

                      <div
                        className={`mx-auto mt-2 max-w-[520px] text-pretty text-sm font-semibold ${fontClass} ${colorClass} opacity-60`}
                        style={{ mixBlendMode: "multiply", textShadow: "0 1px 10px rgba(0,0,0,0.25)" }}
                      >
                        {personalization.verse}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* nav arrows */}
                {gallery.length > 1 ? (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-zinc-900 shadow-sm backdrop-blur-xl transition hover:bg-white"
                      aria-label={language === "es" ? "Anterior" : "Previous"}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-zinc-900 shadow-sm backdrop-blur-xl transition hover:bg-white"
                      aria-label={language === "es" ? "Siguiente" : "Next"}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: details + customization */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-semibold text-zinc-500">{product.category}</div>
                  {lowStock ? (
                    <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-800">
                      {typeof t.lowStockLeft === "function"
                        ? t.lowStockLeft(stockN)
                        : language === "es"
                          ? `Quedan ${stockN}`
                          : `Only ${stockN} left`}
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                  {l10n(product.name, language)}
                </div>

                {hasRatings ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                    <StarRow value={avg} />
                    <span className="font-semibold text-zinc-700">{avg.toFixed(1)}</span>
                    <span className="text-zinc-500">({count})</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <div className="text-sm font-extrabold text-zinc-900">{t.personalizationTitle}</div>
                <div className="mt-1 text-sm text-zinc-600">{t.personalizationSubtitle}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.labelText}</label>
                <input
                  value={text}
                  onChange={(e) => {
                    ensurePreviewActive();
                    setText(e.target.value);
                  }}
                  placeholder={t.textPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <div className="mt-1 text-xs text-zinc-500">{t.textRecommendation}</div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">{t.labelFont}</label>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {FONTS.map((f) => {
                    const selected = font === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => {
                          ensurePreviewActive();
                          setFont(f.id);
                        }}
                        className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        {l10n(f.label, language)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.labelColor}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COLORS.map((c) => {
                    const selected = color === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          ensurePreviewActive();
                          setColor(c.id);
                        }}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${c.swatch}`} />
                        {l10n(c.label, language)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.labelVerse}</label>
                <select
                  value={verse}
                  onChange={(e) => {
                    ensurePreviewActive();
                    setVerse(e.target.value);
                  }}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  {VERSES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  className="w-full justify-center"
                >
                  {t.addToCart}
                </Button>

                {typeof onGoCheckout === "function" ? (
                  <Button variant="secondary" onClick={handleCheckout} className="w-full justify-center">
                    {language === "es" ? "Pagar" : "Checkout"}
                  </Button>
                ) : null}
              </div>

              {desc ? (
                <div className="pt-2 text-sm leading-6 text-zinc-600">
                  {desc}
                </div>
              ) : null}

              {/* Accordions */}
              <div className="mt-2 divide-y divide-zinc-200/60 rounded-[24px] border border-zinc-200/60 bg-white/55 shadow-sm backdrop-blur-xl">
                <details className="group p-4" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900">
                    <span>{language === "es" ? "Entrega y devoluciones" : "Delivery & returns"}</span>
                    <span className="text-zinc-500 transition group-open:rotate-180">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-3 text-sm leading-6 text-zinc-600">
                    {language === "es"
                      ? "Envíos y devoluciones (demo). Luego puedes conectar un proveedor real y políticas oficiales."
                      : "Shipping and returns (demo). You can later connect real carriers and official policies."}
                  </div>
                </details>

                <details className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900">
                    <span>
                      {t.reviewsTitle}
                      {hasRatings ? ` (${count})` : ""}
                    </span>
                    <span className="text-zinc-500 transition group-open:rotate-180">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>

                  <div className="mt-3">
                    {reviewRows.length === 0 ? (
                      <div className="text-sm text-zinc-600">{t.reviewsEmpty}</div>
                    ) : (
                      <div className="grid gap-2">
                        {reviewRows.slice(0, 6).map((r, idx) => (
                          <div
                            key={r?.id || `${r?.ts || "0"}-${idx}`}
                            className="rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-bold text-zinc-900">
                                  {String(r?.name || "").trim() ||
                                    (language === "es" ? "Anónimo" : "Anonymous")}
                                </div>
                                <div className="mt-1">
                                  <StarRow value={Number(r?.rating) || 0} />
                                </div>
                              </div>
                              <div className="text-xs text-zinc-500">
                                {typeof r?.ts === "number" ? new Date(r.ts).toLocaleDateString() : ""}
                              </div>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-zinc-700">{r?.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={submitReview} className="mt-4 grid gap-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">{t.reviewRatingLabel}</label>
                          <select
                            value={String(reviewRating)}
                            onChange={(e) => setReviewRating(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          >
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-700">{t.reviewNameLabel}</label>
                          <input
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            placeholder={t.reviewNamePlaceholder}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700">{t.reviewCommentLabel}</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          placeholder={t.reviewCommentPlaceholder}
                          className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                      </div>

                      {reviewError ? (
                        <div className="text-xs font-semibold text-rose-700">{reviewError}</div>
                      ) : null}

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="primary" disabled={!reviewText.trim()}>
                          {t.reviewSubmit}
                        </Button>
                      </div>
                    </form>
                  </div>
                </details>
              </div>

              <div className="text-xs leading-5 text-zinc-500">{t.mvpNote}</div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length ? (
          <div className="mt-10">
            <div className="text-sm font-extrabold tracking-[0.2em] text-zinc-500">
              {language === "es" ? "TAMBIÉN TE PUEDE GUSTAR" : "YOU MIGHT ALSO LIKE"}
            </div>
            <div className="mt-4 flex gap-3 overflow-auto pb-2">
              {related.map((p) => (
                <div key={p.id} className="min-w-[260px] max-w-[260px]">
                  <ProductCard
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
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Footer t={t} />
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
            className={`h-4 w-4 ${on ? "text-amber-500" : "text-zinc-300"}`}
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
