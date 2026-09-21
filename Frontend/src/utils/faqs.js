const DEFAULT_FAQS = [
  {
    id: "shipping",
    enabled: true,
    question: {
      es: "¿Cuánto tarda el envío?",
      en: "How long does shipping take?",
    },
    answer: {
      es: "La mayoría de órdenes se procesan en 1–2 días hábiles. Envío típico: 3–5 días (puede variar por temporada).",
      en: "Most orders are processed within 1–2 business days. Typical shipping: 3–5 days (may vary by season).",
    },
  },
  {
    id: "customization",
    enabled: true,
    question: {
      es: "¿Cómo funciona la personalización?",
      en: "How does customization work?",
    },
    answer: {
      es: "Puedes añadir nombre/frase + un versículo. En el detalle del producto verás una vista previa para ayudarte a decidir.",
      en: "You can add a name/phrase + a verse. On the product detail page you'll see a preview to help you decide.",
    },
  },
  {
    id: "changes",
    enabled: true,
    question: {
      es: "¿Puedo cambiar o cancelar una orden?",
      en: "Can I change or cancel an order?",
    },
    answer: {
      es: "Si la orden aún no está enviada, puedes solicitar la cancelación desde “Estado de la orden”. Si ya está enviada, te ayudamos con el próximo paso.",
      en: "If the order hasn't shipped yet, you can request a cancellation from “Order Status”. If it has shipped, we’ll help with the next steps.",
    },
  },
  {
    id: "payments",
    enabled: true,
    question: {
      es: "¿Qué métodos de pago aceptan?",
      en: "What payment methods do you accept?",
    },
    answer: {
      es: "Actualmente puedes completar tu pedido con PayPal. La opción con tarjeta no está disponible por el momento.",
      en: "You can currently complete your order with PayPal. Card payments are not available right now.",
    },
  },
  {
    id: "stock",
    enabled: true,
    question: {
      es: "¿Qué pasa si un producto no tiene stock?",
      en: "What if an item is out of stock?",
    },
    answer: {
      es: "Si quedan pocas unidades, verás una etiqueta de ‘bajo inventario’. Si se agota, te sugerimos alternativas similares.",
      en: "If stock is low, you’ll see a low-stock badge. If it runs out, we’ll suggest similar alternatives.",
    },
  },
];

function normalizeLocalizedText(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      es: String(value.es || value.en || "").trim(),
      en: String(value.en || value.es || "").trim(),
    };
  }

  const text = String(value || "").trim();
  return { es: text, en: text };
}

export function buildDefaultFaqConfig() {
  return {
    version: 1,
    items: DEFAULT_FAQS.map((item) => ({
      ...item,
      question: { ...item.question },
      answer: { ...item.answer },
    })),
  };
}

export function normalizeFaqItem(item, index = 0) {
  const raw = item && typeof item === "object" ? item : {};
  const id = String(raw.id || `faq-${index + 1}`).trim() || `faq-${index + 1}`;
  const question = normalizeLocalizedText(raw.question || raw.q);
  const answer = normalizeLocalizedText(raw.answer || raw.a);

  return {
    id,
    enabled: raw.enabled !== false,
    question,
    answer,
  };
}

export function normalizeFaqConfig(value) {
  const raw = value && typeof value === "object" ? value : {};
  const rawItems = Array.isArray(raw.items) ? raw.items : DEFAULT_FAQS;
  const seen = new Set();

  const items = rawItems
    .map((item, index) => normalizeFaqItem(item, index))
    .map((item, index) => {
      let id = item.id;
      if (seen.has(id)) id = `${id}-${index + 1}`;
      seen.add(id);
      return { ...item, id };
    })
    .filter((item) => item.id);

  return {
    version: 1,
    items,
  };
}
