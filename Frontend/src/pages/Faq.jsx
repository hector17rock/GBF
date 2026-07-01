import { useState } from "react";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { l10n } from "../utils/format";

export default function Faq({ t, language }) {
  const items = [
    {
      q: { es: "¿Cuánto tarda el envío?", en: "How long does shipping take?" },
      a: {
        es: "La mayoría de órdenes se procesan en 1–2 días hábiles. Envío típico: 3–5 días (puede variar por temporada).",
        en: "Most orders are processed within 1–2 business days. Typical shipping: 3–5 days (may vary by season).",
      },
    },
    {
      q: { es: "¿Cómo funciona la personalización?", en: "How does customization work?" },
      a: {
        es: "Puedes añadir nombre/frase + un versículo. En el detalle del producto verás una vista previa para ayudarte a decidir.",
        en: "You can add a name/phrase + a verse. On the product detail page you'll see a preview to help you decide.",
      },
    },
    {
      q: { es: "¿Puedo cambiar o cancelar una orden?", en: "Can I change or cancel an order?" },
      a: {
        es: "Si la orden aún no está enviada, puedes solicitar cancelación desde “Estatus de Orden”. Si ya está enviada, te ayudamos con el próximo paso.",
        en: "If the order hasn't shipped yet, you can request cancellation from “Order Status”. If it has shipped, we’ll help with next steps.",
      },
    },
    {
      q: { es: "¿Qué métodos de pago aceptan?", en: "What payment methods do you accept?" },
      a: {
        es: "Aceptamos tarjeta y PayPal (en este MVP es una demo visual; luego se integra pago real).",
        en: "We accept card and PayPal (this MVP is a visual demo; real payments will be integrated later).",
      },
    },
    {
      q: { es: "¿Qué pasa si un producto no tiene stock?", en: "What if an item is out of stock?" },
      a: {
        es: "Si quedan pocas unidades, verás un badge de ‘bajo inventario’. Si se agota, te sugerimos alternativas similares.",
        en: "If stock is low, you’ll see a low-stock badge. If it runs out, we’ll suggest similar alternatives.",
      },
    },
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#F8F6F2]/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.faqTitle} subtitle={t.faqSubtitle} />

        <div className="mt-6 grid gap-2">
          {items.map((it, idx) => {
            const open = idx === openIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setOpenIdx(open ? -1 : idx)}
                className="rounded-[22px] border border-[#DDD6CA]/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-extrabold text-[#2B2B2B]">{l10n(it.q, language)}</div>
                  <div className="mt-0.5 text-xs font-bold text-[#6B6B6B]">{open ? "−" : "+"}</div>
                </div>
                {open ? (
                  <div className="mt-3 text-sm leading-6 text-[#6B6B6B]">{l10n(it.a, language)}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
