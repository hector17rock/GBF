const DEFAULT_SOCIALS = [
  {
    id: "instagram",
    label: "Instagram",
    platform: "instagram",
    url: "",
    iconSrc: "/Instagram_icon.png",
    enabled: true,
  },
  {
    id: "tiktok",
    label: "TikTok",
    platform: "tiktok",
    url: "",
    iconSrc: "/tiktok-icon.png",
    enabled: true,
  },
];

export const SOCIAL_PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", iconSrc: "/Instagram_icon.png" },
  { id: "tiktok", label: "TikTok", iconSrc: "/tiktok-icon.png" },
  { id: "facebook", label: "Facebook", iconSrc: "" },
  { id: "youtube", label: "YouTube", iconSrc: "" },
  { id: "x", label: "X / Twitter", iconSrc: "" },
  { id: "whatsapp", label: "WhatsApp", iconSrc: "" },
  { id: "website", label: "Website", iconSrc: "" },
  { id: "custom", label: "Custom", iconSrc: "" },
];

const PLATFORM_BY_ID = SOCIAL_PLATFORM_OPTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function buildDefaultSocialConfig() {
  return {
    version: 1,
    socials: DEFAULT_SOCIALS.map((item) => ({ ...item })),
  };
}

export function normalizeSocialUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

export function getSocialPlatformLabel(platform) {
  const key = String(platform || "").trim().toLowerCase();
  return PLATFORM_BY_ID[key]?.label || PLATFORM_BY_ID.custom.label;
}

export function getSocialPlatformIcon(platform) {
  const key = String(platform || "").trim().toLowerCase();
  return PLATFORM_BY_ID[key]?.iconSrc || "";
}

export function normalizeSocialItem(item, index = 0) {
  const raw = item && typeof item === "object" ? item : {};
  const platformCandidate = String(raw.platform || "").trim().toLowerCase();
  const platform = PLATFORM_BY_ID[platformCandidate] ? platformCandidate : "custom";
  const fallbackLabel = getSocialPlatformLabel(platform);
  const label = String(raw.label || fallbackLabel).trim() || fallbackLabel;
  const customIcon = String(raw.iconSrc || "").trim();
  const platformIcon = getSocialPlatformIcon(platform);
  const id = String(raw.id || `${platform}-${index + 1}`).trim() || `${platform}-${index + 1}`;

  return {
    id,
    label,
    platform,
    url: normalizeSocialUrl(raw.url),
    iconSrc: customIcon || platformIcon,
    enabled: raw.enabled !== false,
  };
}

export function normalizeSocialConfig(value) {
  const raw = value && typeof value === "object" ? value : {};
  const rawSocials = Array.isArray(raw.socials) ? raw.socials : DEFAULT_SOCIALS;
  const seen = new Set();

  const socials = rawSocials
    .map((item, index) => normalizeSocialItem(item, index))
    .map((item, index) => {
      let id = item.id;
      if (seen.has(id)) id = `${id}-${index + 1}`;
      seen.add(id);
      return { ...item, id };
    })
    .filter((item) => item.id && item.label);

  return {
    version: 1,
    socials,
  };
}
