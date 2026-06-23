// Helper: l10n
export function l10n(value, language) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return value[language] ?? value.es ?? "";
  return String(value);
}

// Helper: money
export function money(n, language = "en") {
  const locale = language === "es" ? "es-US" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

// Helper: roundMoney
export function roundMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

// Helper: parseNumberOr
export function parseNumberOr(value, fallback = 0) {
  const s = String(value ?? "").trim();
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

// Helper: formatRatePct
export function formatRatePct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "";
  return x % 1 === 0 ? x.toFixed(1) : String(x);
}
