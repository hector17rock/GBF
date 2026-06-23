// -----------------------------
// Catalog defaults + normalization
// -----------------------------

function parseNumberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildDefaultCategories() {
  return ["Yeti", "Journals"];
}

export function normalizeCategories(input) {
  const base = buildDefaultCategories();
  if (!Array.isArray(input)) return base;

  const out = [];
  for (const item of input) {
    const s = String(item ?? "").trim();
    if (!s) continue;
    if (!out.includes(s)) out.push(s);
  }

  return out.length ? out : base;
}

export function buildDefaultProducts() {
  return [
    {
      id: "yeti-20",
      category: "Yeti",
      name: { es: "Yeti Rambler 20oz", en: "Yeti Rambler 20oz" },
      price: 40,
      short: {
        es: "Vaso premium para regalos con propósito.",
        en: "Premium tumbler for meaningful gifts.",
      },
      description: {
        es: "Un vaso resistente para el día a día. Personalízalo con nombre, frase o versículo y conviértelo en un regalo memorable.",
        en: "A durable tumbler for everyday life. Customize it with a name, phrase, or verse and turn it into a memorable gift.",
      },
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
      tags: [
        { es: "Regalo", en: "Gift" },
        { es: "Premium", en: "Premium" },
        { es: "Personalizable", en: "Customizable" },
      ],
    },
    {
      id: "journal-1",
      category: "Journals",
      name: { es: "Libreta Journal (A5)", en: "Journal notebook (A5)" },
      price: 26,
      short: { es: "Journaling y devocional diario.", en: "Journaling and daily devotional." },
      description: {
        es: "Una libreta para escribir, orar y reflexionar. Perfecta para rutinas de fe, metas y gratitud.",
        en: "A notebook to write, pray, and reflect. Perfect for faith routines, goals, and gratitude.",
      },
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
      tags: [
        { es: "Devocional", en: "Devotional" },
        { es: "Hábitos", en: "Habits" },
        { es: "Regalo", en: "Gift" },
      ],
    },
  ];
}

export function normalizeProducts(input) {
  const base = buildDefaultProducts();
  if (!Array.isArray(input)) return base;

  const out = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const id = String(item.id ?? "").trim();
    if (!id) continue;

    const category = String(item.category ?? "").trim();
    const price = Math.max(0, parseNumberOr(item.price, 0));

    const name =
      item.name && typeof item.name === "object"
        ? { es: String(item.name.es ?? "").trim(), en: String(item.name.en ?? "").trim() }
        : { es: "", en: "" };

    const short =
      item.short && typeof item.short === "object"
        ? { es: String(item.short.es ?? "").trim(), en: String(item.short.en ?? "").trim() }
        : { es: "", en: "" };

    const description =
      item.description && typeof item.description === "object"
        ? {
            es: String(item.description.es ?? "").trim(),
            en: String(item.description.en ?? "").trim(),
          }
        : { es: "", en: "" };

    const image = String(item.image ?? "").trim();

    const tags = Array.isArray(item.tags)
      ? item.tags
          .filter((t) => t && typeof t === "object")
          .map((t) => ({ es: String(t.es ?? "").trim(), en: String(t.en ?? "").trim() }))
          .filter((t) => t.es || t.en)
      : [];

    out.push({
      id,
      category,
      name,
      price,
      short,
      description,
      image,
      tags,
    });
  }

  return out.length ? out : base;
}
