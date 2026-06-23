import { useState } from "react";
import { COLORS, FONTS, VERSES } from "../data/catalog";
import Button from "../components/Button";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { l10n, money } from "../utils/format";

export default function ProductDetail({ product, onBack, onAddToCart, t, language }) {
  const [text, setText] = useState("");
  const [verse, setVerse] = useState(VERSES[1]);
  const [font, setFont] = useState(FONTS[0].id);
  const [color, setColor] = useState(COLORS[0].id);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">{product.category}</div>
            <div className="mt-1 text-2xl font-extrabold text-zinc-900">
              {l10n(product.name, language)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.back}
            </Button>
            <div className="text-lg font-bold text-zinc-900">{money(product.price, language)}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[28px] border border-zinc-200">
            <div className="relative">
              <img
                alt={l10n(product.name, language)}
                src={product.image}
                className="h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-[22px] border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-xs font-semibold text-zinc-500">{t.preview}</div>
                  <div className={`mt-1 text-base font-bold ${fontClass} ${colorClass}`}>
                    {personalization.text.length > 0 ? personalization.text : t.previewFallbackText}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">{personalization.verse}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle title={t.personalizationTitle} subtitle={t.personalizationSubtitle} />

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900">{t.labelText}</label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.textPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <div className="mt-1 text-xs text-zinc-500">{t.textRecommendation}</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">{t.labelVerse}</label>
                <select
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  {VERSES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">{t.labelFont}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                        font === f.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {l10n(f.label, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">{t.labelColor}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        color === c.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full ${c.swatch}`} />
                      {l10n(c.label, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-sm font-bold text-zinc-900">{t.summary}</div>
                <div className="mt-2 text-sm text-zinc-700">
                  <div>
                    <span className="font-semibold">{t.summaryText}</span>{" "}
                    {personalization.text.length ? personalization.text : "—"}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryVerse}</span> {verse}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryFont}</span>{" "}
                    {l10n(FONTS.find((f) => f.id === font)?.label, language)}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryColor}</span>{" "}
                    {l10n(COLORS.find((c) => c.id === color)?.label, language)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => onAddToCart(product, personalization)}
                  className="w-full md:w-auto"
                >
                  {t.addToCart}
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  {t.continueExploring}
                </Button>
              </div>

              <div className="text-xs leading-5 text-zinc-500">{t.mvpNote}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
