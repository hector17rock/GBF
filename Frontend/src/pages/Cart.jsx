import { PR_TAX_MUNICIPAL_RATE_PCT, PR_TAX_STATE_RATE_PCT } from "../data/taxes";
import Button from "../components/Button";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { normalizeCheckoutConfig } from "../utils/checkout";
import {
  formatRatePct,
  l10n,
  money,
  parseNumberOr,
  roundMoney,
} from "../utils/format";

export default function Cart({
  cart,
  checkoutConfig,
  onRemove,
  onCheckout,
  onBack,
  t,
  language,
}) {
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  const cfg = normalizeCheckoutConfig(checkoutConfig);

  const taxStateRate = Math.max(0, parseNumberOr(cfg.prTaxStateRatePct, PR_TAX_STATE_RATE_PCT));
  const taxMunicipalRate = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, PR_TAX_MUNICIPAL_RATE_PCT)
  );

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);

  const shipping = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));
  const total = roundMoney(subtotal + taxAmount + shipping);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA] p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle title={t.cartTitle} subtitle={t.cartSubtitle} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.continueShopping}
            </Button>
            <div className="text-lg font-bold text-[#2B2B2B]">{money(total, language)}</div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-6 text-sm text-[#6B6B6B] shadow-sm backdrop-blur-xl">
            {t.emptyCart}
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((it) => (
              <div
                key={it.key}
                className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#6B6B6B]">{it.category}</div>
                    <div className="mt-1 text-sm font-bold text-[#2B2B2B]">
                      {l10n(it.name, language)}
                    </div>
                    <div className="mt-2 text-sm text-[#6B6B6B]">
                      {it.personalization.text ? (
                        <>
                          <span className="font-semibold">{t.summaryText}</span>{" "}
                          {it.personalization.text}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{t.summaryText}</span> —
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-[#6B6B6B]">
                      <span className="font-semibold">{t.summaryVerse}</span>{" "}
                      {it.personalization.verse}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-[#2B2B2B]">{money(it.price, language)}</div>
                    <div className="mt-2 text-xs text-[#6B6B6B]">
                      {t.qty}: {it.qty}
                    </div>
                    <div className="mt-3">
                      <Button variant="secondary" onClick={() => onRemove(it.key)}>
                        {t.remove}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div>
                <div className="text-sm font-bold text-[#2B2B2B]">{t.total}</div>
                <div className="text-sm text-[#6B6B6B]">{t.estimatedTotal}</div>

                <div className="mt-3 grid gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-[#6B6B6B]">{t.checkoutSubtotal}</div>
                    <div className="font-semibold text-[#2B2B2B]">{money(subtotal, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[#6B6B6B]">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-semibold text-[#2B2B2B]">{money(taxStateAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[#6B6B6B]">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-[#2B2B2B]">{money(taxMunicipalAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[#6B6B6B]">
                      {t.taxPrTotal} ({formatRatePct(taxStateRate + taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-[#2B2B2B]">{money(taxAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[#6B6B6B]">{t.checkoutShippingFee}</div>
                    <div className="font-semibold text-[#2B2B2B]">{money(shipping, language)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-lg font-extrabold text-[#2B2B2B]">{money(total, language)}</div>
                <Button variant="primary" onClick={onCheckout}>
                  {t.goToCheckout}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}
