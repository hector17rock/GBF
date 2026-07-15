export function buildDefaultPoliciesConfig() {
  return {
    categories: [
      { id: "shipping", name: "Envíos", content: "" },
      { id: "returns", name: "Devoluciones", content: "" },
      { id: "privacy", name: "Privacidad", content: "" },
    ],
  };
}

export function normalizePoliciesConfig(input) {
  const base = buildDefaultPoliciesConfig();
  const cfg = input && typeof input === "object" ? input : {};

  const rawCats = Array.isArray(cfg.categories) ? cfg.categories : [];

  const categories = rawCats
    .map((c, idx) => {
      const obj = c && typeof c === "object" ? c : {};
      const idRaw = String(obj.id ?? "").trim();
      const id = idRaw || `policy-${idx + 1}`;

      return {
        id,
        name: String(obj.name ?? "").trim(),
        content: String(obj.content ?? ""),
      };
    })
    .filter((c) => c.id);

  // Ensure unique IDs (keep first)
  const seen = new Set();
  const unique = [];
  for (const c of categories) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    unique.push(c);
  }

  return {
    ...base,
    ...cfg,
    categories: unique,
  };
}
