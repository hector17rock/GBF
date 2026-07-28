import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { translations } from "./i18n/translations";
import { COLLECTIONS, VERSES, FONTS, COLORS, DAILY_VERSES } from "./data/catalog";
import {
  buildDefaultCategories,
  normalizeCategories,
  buildDefaultProducts,
  normalizeProducts,
} from "./data/defaultCatalog";
import { PR_TAX_STATE_RATE_PCT, PR_TAX_MUNICIPAL_RATE_PCT, PR_TAX_TOTAL_RATE_PCT } from "./data/taxes";
import { l10n, money, roundMoney, parseNumberOr, formatRatePct } from "./utils/format";
import Button from "./components/Button";
import SlideToSubmit from "./components/SlideToSubmit";
import Footer from "./components/Footer";
import Pill from "./components/Pill";
import ProductCard from "./components/ProductCard";
import DailyVerseCard from "./components/DailyVerseCard";
import NewsletterSignup from "./components/NewsletterSignup";
import SectionTitle from "./components/SectionTitle";
import TestimonialCard from "./components/TestimonialCard";
import ToastStack from "./components/ToastStack";
import TopBar from "./components/TopBar";
import PageTransition from "./components/PageTransition";
import { TESTIMONIALS } from "./data/testimonials";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Faq from "./pages/Faq";
import Policies from "./pages/Policies";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";
import {
  buildDefaultCheckoutConfig,
  normalizeCheckoutConfig,
  buildDefaultCheckoutDraft,
  normalizeCheckoutDraft,
} from "./utils/checkout";
import { buildDefaultPoliciesConfig, normalizePoliciesConfig } from "./utils/policies";
import {
  normalizeOrderStatus,
  isOpenOrderStatus,
  orderStatusLabel,
  orderStatusBadgeClass,
} from "./utils/orders";
import { getPrTaxBreakdownFromOrder } from "./utils/taxes";
import { escapeHtml, openPrintWindow } from "./utils/print";

// =====================================================
// App.jsx (single-file MVP) — Sections & Functions Index
// =====================================================
// Data/constants: COLLECTIONS, VERSES, FONTS, COLORS
// i18n: translations (es/en)
// localStorage: *_STORAGE_KEY
// Helpers: buildDefaultHeroConfig, normalizeHeroConfig, l10n, money
// UI components: Button, Pill, SectionTitle, Stat, TopBar, NavLink, MobileTab
// Home components: CollectionCards, Hero, ProductCard, Step
// Pages: Home, Catalog, ProductDetail, Cart, Checkout, Blog, About, AdminPanel
// Root: App

// -----------------------------
// Data: COLLECTIONS / VERSES / FONTS / COLORS
// (moved to src/data/catalog.js)
// -----------------------------

// -----------------------------
// i18n: translations (ES/EN)
// -----------------------------
// (moved to src/i18n/translations.js)


// -----------------------------
// Local images folder
// -----------------------------
// Put local images in: public/images/
// Then reference them like: "/images/hero.jpg" (Vite serves from /public)
// -----------------------------
// localStorage Keys
// -----------------------------
const HERO_STORAGE_KEY = "gbf.homeHero.v1";
const INVENTORY_STORAGE_KEY = "gbf.inventory.v1";
const PRODUCT_COSTS_STORAGE_KEY = "gbf.productCosts.v1";
const SALES_STORAGE_KEY = "gbf.sales.v1";
const ORDERS_STORAGE_KEY = "gbf.orders.v1";
const ORDER_COUNTER_STORAGE_KEY = "gbf.orderCounter.v1";
const CHECKOUT_CONFIG_STORAGE_KEY = "gbf.checkoutConfig.v1";
const CATEGORIES_STORAGE_KEY = "gbf.categories.v1";
const PRODUCTS_STORAGE_KEY = "gbf.products.v1";
const FAVORITES_STORAGE_KEY = "gbf.favorites.v1";
const RECENTLY_VIEWED_STORAGE_KEY = "gbf.recentlyViewed.v1";
const REVIEWS_STORAGE_KEY = "gbf.reviews.v1";
const NEWSLETTER_EMAILS_STORAGE_KEY = "gbf.newsletterEmails.v1";
const ACTIVITY_LOG_STORAGE_KEY = "gbf.activityLog.v1";
const POLICIES_STORAGE_KEY = "gbf.policies.v1";

// -----------------------------
// Puerto Rico taxes (split)
// (moved to src/data/taxes.js)
// -----------------------------

// -----------------------------
// Checkout helpers
// (moved to src/utils/checkout.js)
// -----------------------------
// -----------------------------
// Catalog defaults + persistence helpers
// -----------------------------
// (moved to src/data/defaultCatalog.js)

// -----------------------------
// IDs (avoid crypto.randomUUID dependency on older browsers)
// -----------------------------
let __gbfIdCounter = 0;
function safeUUID(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  __gbfIdCounter = (__gbfIdCounter + 1) % 1_000_000_000;
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}-${Date.now()}-${__gbfIdCounter}-${rand}`;
}

// -----------------------------
// Card brand helpers (simple client-side detection)
// -----------------------------
function detectCardBrand(number) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";

  // Amex: 34, 37
  if (/^3[47]/.test(digits)) return "amex";

  // Visa: 4
  if (/^4/.test(digits)) return "visa";

  // MasterCard: 51-55, 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "mastercard";

  // Discover: 6011, 65, 644-649
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";

  // JCB: 3528-3589
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return "jcb";

  // Diners (optional): 300-305, 36, 38-39
  if (/^(30[0-5]|36|3[89])/.test(digits)) return "diners";

  return "";
}

function formatCardNumberForDisplay(number, brand) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";

  if (brand === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  // Default: group in 4s (supports 16-19 digits)
  return digits
    .match(/.{1,4}/g)
    ?.join(" ")
    .trim() || digits;
}

function sanitizeCardNumberInput(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const brand = detectCardBrand(digits);

  const maxLen = brand === "amex" ? 15 : 19;
  const capped = digits.slice(0, maxLen);

  return {
    brand,
    digits: capped,
    formatted: formatCardNumberForDisplay(capped, brand),
  };
}

function sanitizeExpiryInput(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function sanitizeCvcInput(raw, brand) {
  const maxLen = brand === "amex" ? 4 : 3;
  return String(raw || "").replace(/\D/g, "").slice(0, maxLen);
}

// Provided logo assets (from /public)
const PROVIDED_LOGOS = {
  paypal: "/paypallogo.png",
  visa: "/visa-logo-png-image-4.png",
  mastercard: "/Mastercard-Logo.png",
  amex: "/American_ExpressLogo.png",
  discover: "/Discover-logo.png",
};

// Component: PayPalLogo
function PayPalLogo({ className = "" }) {
  return (
    <img
      src={PROVIDED_LOGOS.paypal}
      alt="PayPal"
      className={`block object-contain ${className}`.trim()}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}

// Component: CreditCardBrandLogo
function CreditCardBrandLogo({ brand, active = false, className = "" }) {
  const base = "inline-flex h-9 w-[78px] items-center justify-center rounded-xl border bg-white p-1";
  const border = active ? "border-zinc-900" : "border-zinc-200";

  const [imgFailed, setImgFailed] = useState(false);

  const title =
    brand === "visa"
      ? "Visa"
      : brand === "mastercard"
      ? "Mastercard"
      : brand === "amex"
      ? "American Express"
      : brand === "discover"
      ? "Discover"
      : "";

  const imgSrc =
    brand === "visa"
      ? PROVIDED_LOGOS.visa
      : brand === "mastercard"
      ? PROVIDED_LOGOS.mastercard
      : brand === "amex"
      ? PROVIDED_LOGOS.amex
      : brand === "discover"
      ? PROVIDED_LOGOS.discover
      : "";

  const commonSvgProps = {
    viewBox: "0 0 72 32",
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
    "aria-label": title,
    className: "block h-7 w-[70px]",
  };

  const textProps = {
    textAnchor: "middle",
    dominantBaseline: "middle",
    x: 36,
    y: 16,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    fontWeight: 900,
    letterSpacing: 1,
  };

  const fallbackLogo =
    brand === "visa" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#1A1F71" />
        <text {...textProps} fill="#fff" fontSize="11">
          VISA
        </text>
      </svg>
    ) : brand === "mastercard" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#ffffff" stroke="#e5e7eb" />
        <circle cx="33" cy="16" r="7" fill="#EB001B" opacity="0.95" />
        <circle cx="39" cy="16" r="7" fill="#F79E1B" opacity="0.95" />
        <text
          x="36"
          y="26"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#111"
          fontSize="6"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="900"
          letterSpacing="0.6"
        >
          MC
        </text>
      </svg>
    ) : brand === "amex" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#2E77BC" />
        <text {...textProps} fill="#fff" fontSize="11">
          AMEX
        </text>
      </svg>
    ) : brand === "discover" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#ffffff" stroke="#e5e7eb" />
        <path d="M46 23c10-3 18-8 22-10" fill="none" stroke="#FF6A00" strokeWidth="3" />
        <circle cx="36" cy="16" r="5" fill="#FF6A00" opacity="0.9" />
        <text
          x="14"
          y="16"
          dominantBaseline="middle"
          fill="#111"
          fontSize="9"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="900"
        >
          DISC
        </text>
      </svg>
    ) : null;

  // Prefer the PNG, but fall back to SVG if the image fails to load
  // (intermittent network/cache issues, dev server restarts, etc.)
  if (imgSrc && !imgFailed) {
    return (
      <span title={title} className={`${base} ${border} ${className}`.trim()}>
        <img
          src={imgSrc}
          alt={title}
          className="block h-7 w-[70px] object-contain"
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  return (
    <span title={title} className={`${base} ${border} ${className}`.trim()}>
      {fallbackLogo}
    </span>
  );
}


// -----------------------------
// PayPal JS SDK loader (Smart Buttons)
// -----------------------------
let __gbfPayPalSdkKey = "";
let __gbfPayPalSdkPromise = null;

function loadPayPalSdk({ clientId, currency }) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("paypal_sdk_unavailable"));
  }

  const id = String(clientId || "").trim();
  const cur = String(currency || "USD").trim().toUpperCase() || "USD";
  if (!id) return Promise.reject(new Error("missing_paypal_client_id"));

  const key = `${id}|${cur}`;

  if (window.paypal && __gbfPayPalSdkPromise && __gbfPayPalSdkKey === key) {
    return __gbfPayPalSdkPromise;
  }

  // If a different clientId/currency is requested, remove the old script.
  if (__gbfPayPalSdkKey && __gbfPayPalSdkKey !== key) {
    const old = document.querySelector('script[data-gbf-paypal-sdk="1"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    __gbfPayPalSdkPromise = null;
  }

  __gbfPayPalSdkKey = key;

  if (__gbfPayPalSdkPromise) return __gbfPayPalSdkPromise;

  __gbfPayPalSdkPromise = new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const existing = document.querySelector('script[data-gbf-paypal-sdk="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", () => reject(new Error("paypal_sdk_load_failed")));
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.gbfPaypalSdk = "1";
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(id)}&currency=${encodeURIComponent(cur)}&intent=capture`;

    script.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else reject(new Error("paypal_sdk_loaded_but_missing"));
    };

    script.onerror = () => reject(new Error("paypal_sdk_load_failed"));

    document.head.appendChild(script);
  });

  return __gbfPayPalSdkPromise;
}


// -----------------------------
// Hero promo defaults (used by Home + Admin)
// -----------------------------
const DEFAULT_HERO_IMAGES = {
  hero: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=1400&q=80",
  product1:
    "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80",
  product2:
    "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
};

const HERO_BENEFIT_ICON_LIBRARY = [
  {
    id: "truck",
    label: { es: "Envío", en: "Shipping" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <path d="M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
        <path d="M17 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      </svg>
    ),
  },
  {
    id: "badge",
    label: { es: "Calidad", en: "Quality" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" />
      </svg>
    ),
  },
  {
    id: "heart",
    label: { es: "Fe", en: "Faith" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M12 21s-7-4.4-9.5-9C1 9 2.8 6 6 6c1.8 0 3.1 1 4 2 0.9-1 2.2-2 4-2 3.2 0 5 3 3.5 6-2.5 4.6-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    id: "lock",
    label: { es: "Seguro", en: "Secure" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M6 11V8a6 6 0 1 1 12 0v3" />
        <path d="M5 11h14v10H5z" />
      </svg>
    ),
  },
  {
    id: "gift",
    label: { es: "Regalo", en: "Gift" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M20 12v10H4V12" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C10 2 12 7 12 7Z" />
        <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C14 2 12 7 12 7Z" />
      </svg>
    ),
  },
  {
    id: "tag",
    label: { es: "Oferta", en: "Deal" },
    render: ({ className = "h-5 w-5", strokeWidth = 2 } = {}) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      >
        <path d="M20 12l-8 8-10-10V2h8z" />
        <path d="M7 7h.01" />
      </svg>
    ),
  },
];

const HERO_BENEFIT_ICON_BY_ID = Object.fromEntries(
  HERO_BENEFIT_ICON_LIBRARY.map((x) => [x.id, x])
);

function HeroBenefitIcon({ iconId, className = "h-5 w-5", strokeWidth = 2 }) {
  const id = String(iconId || "").trim();
  const item = HERO_BENEFIT_ICON_BY_ID[id] || HERO_BENEFIT_ICON_BY_ID.truck;
  return item?.render ? item.render({ className, strokeWidth }) : null;
}

function buildDefaultHeroBenefits() {
  return [
    {
      id: "benefit-1",
      iconId: "truck",
      title: {
        es: translations.es.homeBenefit1Title,
        en: translations.en.homeBenefit1Title,
      },
      body: {
        es: translations.es.homeBenefit1Body,
        en: translations.en.homeBenefit1Body,
      },
    },
    {
      id: "benefit-2",
      iconId: "badge",
      title: {
        es: translations.es.homeBenefit2Title,
        en: translations.en.homeBenefit2Title,
      },
      body: {
        es: translations.es.homeBenefit2Body,
        en: translations.en.homeBenefit2Body,
      },
    },
    {
      id: "benefit-3",
      iconId: "heart",
      title: {
        es: translations.es.homeBenefit3Title,
        en: translations.en.homeBenefit3Title,
      },
      body: {
        es: translations.es.homeBenefit3Body,
        en: translations.en.homeBenefit3Body,
      },
    },
    {
      id: "benefit-4",
      iconId: "lock",
      title: {
        es: translations.es.homeBenefit4Title,
        en: translations.en.homeBenefit4Title,
      },
      body: {
        es: translations.es.homeBenefit4Body,
        en: translations.en.homeBenefit4Body,
      },
    },
  ];
}

function normalizeHeroBenefits(input) {
  const base = buildDefaultHeroBenefits();
  const raw = Array.isArray(input) ? input : [];

  return base.map((b, idx) => {
    const it = raw[idx] && typeof raw[idx] === "object" ? raw[idx] : {};

    const iconIdCandidate = String(it.iconId || "").trim();
    const iconId = HERO_BENEFIT_ICON_BY_ID[iconIdCandidate] ? iconIdCandidate : b.iconId;

    return {
      ...b,
      ...it,
      iconId,
      title: { ...b.title, ...(it.title || {}) },
      body: { ...b.body, ...(it.body || {}) },
    };
  });
}

// Helper: buildDefaultHeroConfig
function buildDefaultHeroConfig() {
  return {
    enabled: false,
    promoType: "content", // "content" | "promo"
    promoSchedule: {
      startLocal: "", // datetime-local string (YYYY-MM-DDTHH:mm)
      endLocal: "",
    },
    pill: { es: translations.es.heroPill, en: translations.en.heroPill },
    titleOne: { es: translations.es.heroTitleOne, en: translations.en.heroTitleOne },
    titleTwo: { es: translations.es.heroTitleTwo, en: translations.en.heroTitleTwo },
    text: { es: translations.es.heroText, en: translations.en.heroText },
    primary: { es: translations.es.heroPrimary, en: translations.en.heroPrimary },
    secondary: {
      es: translations.es.heroSecondary,
      en: translations.en.heroSecondary,
    },
    images: { ...DEFAULT_HERO_IMAGES },
    benefits: buildDefaultHeroBenefits(),
  };
}

// Helper: normalizeHeroConfig
function normalizeHeroConfig(input) {
  const base = buildDefaultHeroConfig();
  const cfg = input && typeof input === "object" ? input : {};

  const promoType = cfg.promoType === "promo" ? "promo" : "content";

  return {
    ...base,
    ...cfg,
    promoType,
    promoSchedule: {
      ...base.promoSchedule,
      ...(cfg.promoSchedule || {}),
    },
    pill: { ...base.pill, ...(cfg.pill || {}) },
    titleOne: { ...base.titleOne, ...(cfg.titleOne || {}) },
    titleTwo: { ...base.titleTwo, ...(cfg.titleTwo || {}) },
    text: { ...base.text, ...(cfg.text || {}) },
    primary: { ...base.primary, ...(cfg.primary || {}) },
    secondary: { ...base.secondary, ...(cfg.secondary || {}) },
    images: { ...base.images, ...(cfg.images || {}) },
    benefits: normalizeHeroBenefits(cfg.benefits),
  };
}



// Helper: fileToDataUrl (for Admin image uploads)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}


// Helper: buildUploadFilename
function buildUploadFilename(prefix, file) {
  const base = String(file?.name || "upload").replace(/\s+/g, "-");
  const id = safeUUID("upload");
  return `${prefix}-${id}-${base}`;
}


// Helper: uploadImageToPublicImages (dev-server endpoint)
async function uploadImageToPublicImages({ file, filename }) {
  const dataUrl = await fileToDataUrl(file);

  const res = await fetch("/__gbf_upload_image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, dataUrl }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok || typeof json?.url !== "string") {
    throw new Error(json?.error || `Upload failed (${res.status})`);
  }

  return json.url;
}


// Helper: localDateTimeStringToMs
function localDateTimeStringToMs(value) {
  const s = String(value || "").trim();
  if (!s) return Number.NaN;

  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) return Number.NaN;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] || 0);

  const dt = new Date(year, month - 1, day, hour, minute, second, 0);
  return dt.getTime();
}


// Helper: formatHms
function formatHms(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


// Helper: isHeroOverrideActiveAt
function isHeroOverrideActiveAt(heroConfig, nowMs = Date.now()) {
  const enabled = Boolean(heroConfig?.enabled);
  if (!enabled) return false;

  const promoType = heroConfig?.promoType === "promo" ? "promo" : "content";
  if (promoType !== "promo") return true;

  const startMs = localDateTimeStringToMs(heroConfig?.promoSchedule?.startLocal);
  const endMs = localDateTimeStringToMs(heroConfig?.promoSchedule?.endLocal);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;

  return nowMs >= startMs && nowMs <= endMs;
}


// Helper: isHeroOverrideActive
function isHeroOverrideActive(heroConfig) {
  return isHeroOverrideActiveAt(heroConfig, Date.now());
}










// PR tax + order status helpers moved to src/utils/taxes.js and src/utils/orders.js


// Print helpers moved to src/utils/print.js


// Helper: getNextOrderNumber
function getNextOrderNumber() {
  const fallback = `GBF-${Date.now()}`;
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(ORDER_COUNTER_STORAGE_KEY);
    const prev = Number(raw);
    const base = Number.isFinite(prev) && prev > 0 ? prev : 0;
    const next = base + 1;
    window.localStorage.setItem(ORDER_COUNTER_STORAGE_KEY, String(next));
    return `GBF-${String(next).padStart(6, "0")}`;
  } catch {
    return fallback;
  }
}

// --------------------------------------
// Barcode: Code 128 (subset B) as inline SVG
// --------------------------------------
const CODE128_TABLE = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
];

function code128BValueForChar(ch) {
  const code = typeof ch === "string" && ch.length ? ch.charCodeAt(0) : 0;
  if (code < 32 || code > 126) return null;
  return code - 32;
}

function buildCode128BSequence(text) {
  const s = String(text || "");
  if (!s.trim()) return null;

  const values = [];
  for (const ch of s) {
    const v = code128BValueForChar(ch);
    if (v == null) return null;
    values.push(v);
  }

  const START_B = 104;
  const STOP = 106;

  let sum = START_B;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i] * (i + 1);
  }
  const check = sum % 103;

  return [START_B, ...values, check, STOP];
}

function buildCode128Svg(text, { modulePx = 2, heightPx = 56, quietModules = 10 } = {}) {
  const seq = buildCode128BSequence(text);
  if (!seq) return "";

  const rects = [];
  let x = quietModules * modulePx;

  for (const code of seq) {
    const pattern = CODE128_TABLE[code];
    if (!pattern) return "";

    let isBar = true;
    for (const d of String(pattern)) {
      const w = Number(d) * modulePx;
      if (isBar) {
        rects.push(`<rect x="${x}" y="0" width="${w}" height="${heightPx}" />`);
      }
      x += w;
      isBar = !isBar;
    }
  }

  x += quietModules * modulePx;

  const widthPx = Math.max(1, x);

  return (
    `<svg class="barcodeSvg" viewBox="0 0 ${widthPx} ${heightPx}" width="100%" height="${heightPx}" ` +
    `xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode">` +
    `<rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="#fff" />` +
    `<g fill="#000">${rects.join("")}</g>` +
    `</svg>`
  );
}


// Helper: buildShippingLabelHtml
function buildShippingLabelHtml({ order, language }) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const toName = escapeHtml(order?.customer?.name || "");

  const ship = order?.shipping || {};
  const lines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  const toAddress = lines.map((l) => `<div>${escapeHtml(l)}</div>`).join("");

  const orderNo = escapeHtml(order?.orderNumber || order?.id || "");

  const trackingRaw = String(order?.trackingNumber || "").trim();
  const trackingText = trackingRaw.replace(/\s+/g, "").trim();
  const barcodeSvg = trackingText
    ? buildCode128Svg(trackingText, { modulePx: 2, heightPx: 56, quietModules: 10 })
    : "";

  return `
  <div class="page">
    <div class="row">
      <div class="from">
        <div class="brand">Grow by Faith<span style="font-size:0.6em; vertical-align:super; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-weight:700;">®</span></div>
      </div>
      <div class="order">
        <div class="muted">${escapeHtml(tr.shippingLabelOrder)}</div>
        <div class="orderNo">${orderNo}</div>
      </div>
    </div>

    <div class="box">
      <div class="muted">${escapeHtml(tr.shippingLabelShipTo)}</div>
      <div class="name">${toName || "—"}</div>
      <div class="address">${toAddress || "<div>—</div>"}</div>

      ${barcodeSvg
        ? `
      <div class="barcodeBlock">
        <div class="barcodeLabel">${escapeHtml(tr.ordersTrackingNumberLabel || "Tracking #")}</div>
        <div class="barcodeImg">${barcodeSvg}</div>
        <div class="barcodeText">${escapeHtml(trackingText)}</div>
      </div>`
        : ""}
    </div>

    <div class="footer">
      <div class="small muted">${escapeHtml(tr.shippingLabelPrintedFromAdmin)}</div>
    </div>
  </div>`;
}


// Helper: buildReceiptHtml
function buildReceiptHtml({ order, language }) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const orderNo = escapeHtml(order?.orderNumber || order?.id || "");
  const createdAt =
    typeof order?.createdAt === "number"
      ? new Date(order.createdAt).toLocaleString(lang === "es" ? "es-US" : "en-US")
      : "";

  const customerName = escapeHtml(order?.customer?.name || "");
  const customerPhone = escapeHtml(order?.customer?.phone || "");
  const customerEmail = escapeHtml(order?.customer?.email || "");
  const customerNotes = escapeHtml(order?.customer?.notes || "");

  const ship = order?.shipping || {};
  const shipLines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  const shipHtml = shipLines.map((l) => `<div>${escapeHtml(l)}</div>`).join("");

  const items = Array.isArray(order?.items) ? order.items : [];
  const rows = items
    .map((it) => {
      const name = escapeHtml(l10n(it?.name, lang));
      const qty = Number(it?.qty) || 0;
      const unitPrice = Number(it?.unitPrice) || 0;
      const lineTotal = qty * unitPrice;
      const p = it?.personalization || {};
      const pText = escapeHtml(p.text || "");
      const pVerse = escapeHtml(p.verse || "");
      const pExtra = [
        pText ? `${lang === "es" ? "Texto" : "Text"}: ${pText}` : "",
        pVerse ? `${lang === "es" ? "Versículo" : "Verse"}: ${pVerse}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td>
            <div class="itemName">${name}</div>
            ${pExtra ? `<div class="itemMeta">${pExtra}</div>` : ""}
          </td>
          <td class="qty">${qty}</td>
          <td class="money">${escapeHtml(money(unitPrice, lang))}</td>
          <td class="money">${escapeHtml(money(lineTotal, lang))}</td>
        </tr>`;
    })
    .join("");

  const total = Number(order?.total) || 0;
  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : roundMoney(
        items.reduce(
          (acc, it) => acc + (Number(it?.qty) || 0) * (Number(it?.unitPrice) || 0),
          0
        )
      );

  const prTax = getPrTaxBreakdownFromOrder(order, subtotal);

  const shippingFee = Number.isFinite(Number(order?.shippingFee)) ? Number(order.shippingFee) : 0;

  const paymentText =
    order?.paymentMethod === "paypal" || order?.paymentMethod === "whatsapp"
      ? tr.ordersPaymentPayPal
      : tr.ordersPaymentCard;

  const tracking = escapeHtml(order?.trackingNumber || "");
  const etaText = escapeHtml(order?.etaText || "");

  return `
  <div class="receipt">
    <div class="header">
      <div>
        <div class="brandRow">
          <img class="brandLogo" src="/gbficon.png" alt="Grow by Faith®" />
          <div class="brandName">Grow by Faith<span style="font-size:0.6em; vertical-align:super; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-weight:700;">®</span></div>
        </div>
        <div class="muted">${lang === "es" ? "Recibo" : "Receipt"}</div>
      </div>
      <div class="right">
        <div class="muted">${lang === "es" ? "Orden" : "Order"}</div>
        <div class="orderNo">${orderNo}</div>
        <div class="muted">${escapeHtml(createdAt)}</div>
      </div>
    </div>

    <div class="muted" style="margin-top: 6px;">
      ${lang === "es" ? "Método de pago" : "Payment method"}: ${escapeHtml(paymentText)}
      ${tracking ? ` · ${lang === "es" ? "Tracking" : "Tracking"}: ${tracking}` : ""}
      ${etaText ? ` · ${lang === "es" ? "Tiempo" : "ETA"}: ${etaText}` : ""}
    </div>

    <div class="grid">
      <div class="card">
        <div class="cardTitle">${lang === "es" ? "Cliente" : "Customer"}</div>
        <div>${customerName || "—"}</div>
        ${customerPhone ? `<div>${customerPhone}</div>` : ""}
        ${customerEmail ? `<div>${customerEmail}</div>` : ""}
        ${customerNotes ? `<div class="muted">${customerNotes}</div>` : ""}
      </div>
      <div class="card">
        <div class="cardTitle">${lang === "es" ? "Envío" : "Shipping"}</div>
        ${shipHtml || "<div>—</div>"}
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>${lang === "es" ? "Artículo" : "Item"}</th>
          <th class="qty">${lang === "es" ? "Cant." : "Qty"}</th>
          <th class="money">${lang === "es" ? "Precio" : "Price"}</th>
          <th class="money">${lang === "es" ? "Total" : "Total"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows || ""}
      </tbody>
    </table>

    <div style="margin-top: 14px;">
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${lang === "es" ? "Subtotal" : "Subtotal"}</div>
        <div class="money">${escapeHtml(money(subtotal, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrState)} (${escapeHtml(formatRatePct(prTax.stateRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.stateAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrMunicipal)} (${escapeHtml(formatRatePct(prTax.municipalRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.municipalAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrTotal)} (${escapeHtml(formatRatePct(prTax.totalRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.totalAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${lang === "es" ? "Envío" : "Shipping"}</div>
        <div class="money">${escapeHtml(money(shippingFee, lang))}</div>
      </div>
    </div>

    <div class="totalRow">
      <div class="muted">${lang === "es" ? "Total" : "Total"}</div>
      <div class="total">${escapeHtml(money(total, lang))}</div>
    </div>

    <div class="muted footer">
      ${lang === "es" ? "Imprime y guarda como PDF para archivarlo." : "Print and save as PDF to archive."}
    </div>
  </div>`;
}


// Helper: buildProfitReportHtml
function buildProfitReportHtml({
  language,
  profitPeriod,
  profitDate,
  profitRange,
  profitStats,
  taxCollectedStats,
}) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const periodLabel =
    profitPeriod === "day"
      ? tr.profitReportPeriodValueDay
      : profitPeriod === "month"
      ? tr.profitReportPeriodValueMonth
      : tr.profitReportPeriodValueWeek;

  const start =
    typeof profitRange?.startMs === "number" ? new Date(profitRange.startMs) : null;
  const endExclusive =
    typeof profitRange?.endMs === "number" ? new Date(profitRange.endMs) : null;
  const endInclusive = endExclusive ? new Date(endExclusive.getTime() - 1) : null;

  const dateFmt = (d) =>
    d instanceof Date && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "";

  const rangeText =
    start && endInclusive
      ? `${dateFmt(start)} — ${dateFmt(endInclusive)}`
      : profitDate
      ? String(profitDate)
      : "";

  const generatedAt = new Date().toLocaleString(lang === "es" ? "es-US" : "en-US");

  const revenue = Number(profitStats?.revenue) || 0;
  const cogs = Number(profitStats?.cogs) || 0;
  const grossProfit = Number(profitStats?.grossProfit) || 0;
  const margin = Number(profitStats?.margin) || 0;
  const units = Number(profitStats?.units) || 0;

  const taxInRange = Number(taxCollectedStats?.inRange) || 0;
  const taxAllTime = Number(taxCollectedStats?.allTime) || 0;

  const topProducts = Array.isArray(profitStats?.topProducts) ? profitStats.topProducts : [];

  const topRows = topProducts
    .map((p) => {
      const name = escapeHtml(p?.name || p?.productId || "");
      const pUnits = Number(p?.units) || 0;
      const pRevenue = Number(p?.revenue) || 0;
      const pProfit = Number(p?.profit) || 0;

      return `
        <tr>
          <td class="name">${name || "—"}</td>
          <td class="num">${escapeHtml(String(pUnits))}</td>
          <td class="money">${escapeHtml(money(pRevenue, lang))}</td>
          <td class="money">${escapeHtml(money(pProfit, lang))}</td>
        </tr>`;
    })
    .join("");

  const hasSales = Array.isArray(profitStats?.inRange) ? profitStats.inRange.length > 0 : false;

  return `
  <div class="report">
    <div class="header">
      <div class="brandRow">
        <img class="brandLogo" src="/gbficon.png" alt="Grow by Faith®" />
        <div>
          <div class="brandName">Grow by Faith<span style="font-size:0.6em; vertical-align:super; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-weight:700;">®</span></div>
          <div class="muted">${escapeHtml(tr.profitTitle)}</div>
        </div>
      </div>

      <div class="meta">
        <div><span class="label">${escapeHtml(tr.profitPeriodLabel)}:</span> ${escapeHtml(periodLabel)}</div>
        <div><span class="label">${escapeHtml(tr.profitDateLabel)}:</span> ${escapeHtml(profitDate || "")}</div>
        <div><span class="label">${escapeHtml(tr.profitReportRangeLabel)}:</span> ${escapeHtml(rangeText)}</div>
        <div class="muted"><span class="label">${escapeHtml(tr.profitReportGeneratedAt)}:</span> ${escapeHtml(generatedAt)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitRevenue)}</div>
        <div class="cardValue">${escapeHtml(money(revenue, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitCogs)}</div>
        <div class="cardValue">${escapeHtml(money(cogs, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitGrossProfit)}</div>
        <div class="cardValue">${escapeHtml(money(grossProfit, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitMargin)}</div>
        <div class="cardValue">${escapeHtml(`${(margin * 100).toFixed(1)}%`)}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitUnits)}</div>
        <div class="cardValue">${escapeHtml(String(units))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitTaxCollected)}</div>
        <div class="cardValue">${escapeHtml(money(taxInRange, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitTaxCollectedAllTime)}</div>
        <div class="cardValue">${escapeHtml(money(taxAllTime, lang))}</div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle">${escapeHtml(tr.profitTopProducts)}</div>

      ${!hasSales ? `<div class="muted">${escapeHtml(tr.profitNoSales)}</div>` : ""}

      <table class="table">
        <thead>
          <tr>
            <th>${escapeHtml(tr.profitReportTopProductsTableProduct)}</th>
            <th class="num">${escapeHtml(tr.profitReportTopProductsTableUnits)}</th>
            <th class="money">${escapeHtml(tr.profitReportTopProductsTableRevenue)}</th>
            <th class="money">${escapeHtml(tr.profitReportTopProductsTableProfit)}</th>
          </tr>
        </thead>
        <tbody>
          ${topRows || `<tr><td colspan="4" class="muted">${escapeHtml(tr.profitNoSales)}</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="footer muted">${escapeHtml(tr.profitReportFooterHint)}</div>
  </div>`;
}


// Component: Stat
function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
      <div className="text-xs font-semibold text-zinc-500">{label}</div>
      <div className="mt-2 text-base font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

// Component: OrderFlowStepper
function OrderFlowStepper({ currentStep = 1, t }) {
  const steps = [
    { key: "cart", label: t.orderFlowStepCart },
    { key: "checkout", label: t.orderFlowStepCheckout },
    { key: "review", label: t.orderFlowStepReview },
  ];

  const total = steps.length;
  const safeStep = Math.min(Math.max(1, Number(currentStep) || 1), total);
  const progressPct = total <= 1 ? 0 : ((safeStep - 1) / (total - 1)) * 100;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-[#F8F6F2]/70 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-zinc-600">
            {typeof t.orderFlowProgress === "function" ? t.orderFlowProgress(safeStep, total) : ""}
          </div>
        </div>

        <div className="relative mt-3">
          <div className="h-2 w-full rounded-full bg-[#DDD6CA]" />
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-[#355E3B]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {steps.map((s, idx) => {
            const n = idx + 1;
            const done = n < safeStep;
            const current = n === safeStep;

            return (
              <div key={s.key} className="flex flex-col items-center gap-1 text-center">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-extrabold ${
                    done
                      ? "border-[#A8B99A] bg-[#A8B99A]/25 text-[#2B2B2B]"
                      : current
                      ? "border-[#355E3B] bg-[#355E3B] text-white"
                      : "border-[#DDD6CA] bg-[#F8F6F2] text-[#2B2B2B]"
                  }`}
                  aria-label={`${n}`}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    n
                  )}
                </span>
                <div
                  className={`text-[11px] font-semibold leading-4 ${
                    current ? "text-[#2B2B2B]" : "text-[#6B6B6B]"
                  }`}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Component: NavLink
function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

// Component: Hero
function Hero({ onPrimary, onSecondary, t, heroConfig, language }) {
  const cfg = normalizeHeroConfig(heroConfig);

  const promoType = cfg.promoType === "promo" ? "promo" : "content";
  const promoStart = cfg.promoSchedule?.startLocal || "";
  const promoEnd = cfg.promoSchedule?.endLocal || "";

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!cfg.enabled || promoType !== "promo") return;

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [cfg.enabled, promoType, promoStart, promoEnd]);

  const enabled = isHeroOverrideActiveAt(cfg, nowMs);

  const pillOverride = enabled ? l10n(cfg.pill, language).trim() : "";
  const titleOneOverride = enabled ? l10n(cfg.titleOne, language).trim() : "";
  const titleTwoOverride = enabled ? l10n(cfg.titleTwo, language).trim() : "";
  const textOverride = enabled ? l10n(cfg.text, language).trim() : "";
  const primaryOverride = enabled ? l10n(cfg.primary, language).trim() : "";
  const secondaryOverride = enabled ? l10n(cfg.secondary, language).trim() : "";

  const pillText = pillOverride || t.heroPill;
  const titleOne = titleOneOverride || t.heroTitleOne;
  const titleTwo = titleTwoOverride || t.heroTitleTwo;
  const heroText = textOverride || t.heroText;
  const primaryLabel = primaryOverride || t.heroPrimary;
  const secondaryLabel = secondaryOverride || t.heroSecondary;

  const promoEndMs = localDateTimeStringToMs(cfg?.promoSchedule?.endLocal);
  const remainingMs = Number.isFinite(promoEndMs) ? promoEndMs - nowMs : Number.NaN;
  const showCountdown =
    promoType === "promo" &&
    enabled &&
    Number.isFinite(promoEndMs) &&
    Number.isFinite(remainingMs) &&
    remainingMs >= 0;

  const dayMs = 24 * 60 * 60 * 1000;
  const countdownValue = showCountdown
    ? remainingMs > dayMs
      ? t.heroCountdownDays(Math.ceil(remainingMs / dayMs))
      : formatHms(remainingMs)
    : "";

  const heroImage =
    enabled && typeof cfg?.images?.hero === "string" && cfg.images.hero.trim()
      ? cfg.images.hero.trim()
      : DEFAULT_HERO_IMAGES.hero;

  const image1 =
    enabled && typeof cfg?.images?.product1 === "string" && cfg.images.product1.trim()
      ? cfg.images.product1.trim()
      : DEFAULT_HERO_IMAGES.product1;

  const image2 =
    enabled && typeof cfg?.images?.product2 === "string" && cfg.images.product2.trim()
      ? cfg.images.product2.trim()
      : DEFAULT_HERO_IMAGES.product2;

  const benefits = Array.isArray(cfg.benefits) ? cfg.benefits : buildDefaultHeroBenefits();

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#DDD6CA] bg-[#EFE7DA] shadow-sm">
      <div className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
        <div className="flex flex-col justify-center">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[#6B6B6B]">GROW BY FAITH</div>
          <div className="mt-3 text-xs font-semibold text-[#6B6B6B]">{pillText}</div>

          {showCountdown ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#DDD6CA] bg-[#F8F6F2] px-3 py-1 text-xs font-semibold text-[#2B2B2B]">
              <span className="text-[#6B6B6B]">{t.heroCountdownEndsIn}</span>
              <span className="text-[#2B2B2B]">{countdownValue}</span>
            </div>
          ) : null}

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
            <span className="font-serif">{titleOne}</span>
            <span className="block font-serif">{titleTwo}</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#6B6B6B] md:text-base md:leading-7">
            {heroText}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onPrimary} variant="primary">
              {primaryLabel}
            </Button>
            <Button onClick={onSecondary} variant="secondary">
              {secondaryLabel}
            </Button>
          </div>
        </div>

        <div>
          <div className="rounded-[28px] border border-[#DDD6CA] bg-[#F8F6F2] p-4">
            <div className="overflow-hidden rounded-[24px] border border-[#DDD6CA] bg-white">
              <img
                alt="hero"
                src={heroImage}
                className="h-56 w-full object-cover md:h-72"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-[24px] border border-[#DDD6CA] bg-white">
                <img
                  alt="product"
                  src={image1}
                  className="h-28 w-full object-cover md:h-32"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <div className="overflow-hidden rounded-[24px] border border-[#DDD6CA] bg-white">
                <img
                  alt="product"
                  src={image2}
                  className="h-28 w-full object-cover md:h-32"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDD6CA] px-6 py-5 md:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map((b, idx) => {
            const title = l10n(b?.title, language) || "";
            const body = l10n(b?.body, language) || "";
            const key = String(b?.id || idx);

            return (
              <div key={key} className="flex items-start gap-2">
                <div className="mt-0.5 inline-flex shrink-0 text-[#355E3B]">
                  <HeroBenefitIcon iconId={b?.iconId} className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2B2B2B]">{title}</div>
                  <div className="mt-1 text-xs text-[#6B6B6B]">{body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Page: Home
function Home({
  favorites = [],
  recentlyViewedProducts = [],
  stockById,
  ratingSummaryById,
  onGoCatalog,
  onOpenProduct,
  onToggleFavorite,
  notify,
  onSubmitNewsletterEmail,
  t,
  language,
  heroConfig,
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Hero
        onPrimary={onGoCatalog}
        onSecondary={onGoCatalog}
        t={t}
        heroConfig={heroConfig}
        language={language}
      />

      <div className="mt-8">
        <DailyVerseCard verses={DAILY_VERSES} t={t} language={language} notify={notify} />
      </div>


      {recentlyViewedProducts.length ? (
        <div className="mt-10">
          <SectionTitle title={t.recentlyViewedTitle} subtitle={t.recentlyViewedSubtitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {recentlyViewedProducts.map((p) => (
              <ProductCard
                key={p.id}
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
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <SectionTitle title={t.testimonialsTitle} subtitle={t.testimonialsSubtitle} />
        <div className="grid gap-3 md:grid-cols-3">
          {TESTIMONIALS.map((x) => (
            <TestimonialCard key={x.id} testimonial={x} language={language} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <NewsletterSignup t={t} onSubmitEmail={onSubmitNewsletterEmail} />
      </div>

      <div className="mt-10 rounded-[28px] border border-[#DDD6CA] bg-[#EFE7DA] p-6 shadow-sm md:p-10">
        <SectionTitle title={t.stepsTitle} subtitle={t.stepsSubtitle} />
        <div className="grid gap-4 md:grid-cols-3">
          <Step n="1" title={t.step1Title} desc={t.step1Desc} />
          <Step n="2" title={t.step2Title} desc={t.step2Desc} />
          <Step n="3" title={t.step3Title} desc={t.step3Desc} />
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold text-zinc-900">{t.mottoTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.mottoQuote}</p>
        </div>
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold text-zinc-900">{t.quickCtaTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.quickCtaBody}</p>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Component: Step
function Step({ n, title, desc }) {
  return (
    <div className="rounded-[24px] border border-[#DDD6CA] bg-[#F8F6F2] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#355E3B] text-sm font-bold text-white">
          {n}
        </div>
        <div className="text-sm font-bold text-[#2B2B2B]">{title}</div>
      </div>
      <div className="mt-2 text-sm leading-6 text-[#6B6B6B]">{desc}</div>
    </div>
  );
}

// Page: Checkout
function Checkout({
  cart,
  checkoutConfig,
  checkoutDraft,
  setCheckoutDraft,
  onBack,
  onGoReview,
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

  const shippingFeeAmount = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);
  const taxRate = roundMoney(taxStateRate + taxMunicipalRate);

  const grandTotal = roundMoney(subtotal + taxAmount + shippingFeeAmount);

  const draft = normalizeCheckoutDraft(checkoutDraft);
  const paymentMethod = draft.paymentMethod;

  const [paymentMessage, setPaymentMessage] = useState("");
  const [cardMessage, setCardMessage] = useState("");

  const name = String(draft.customer?.name || "");
  const phone = String(draft.customer?.phone || "");
  const email = String(draft.customer?.email || "");
  const notes = String(draft.customer?.notes || "");

  const addressLine1 = String(draft.shipping?.addressLine1 || "");
  const addressLine2 = String(draft.shipping?.addressLine2 || "");
  const city = String(draft.shipping?.city || "");
  const stateRegion = String(draft.shipping?.stateRegion || "");
  const postalCode = String(draft.shipping?.postalCode || "");
  const country = String(draft.shipping?.country || "");

  const cardName = String(draft.card?.name || "");
  const cardNumber = String(draft.card?.number || "");
  const cardExpiry = String(draft.card?.expiry || "");
  const cardCvc = String(draft.card?.cvc || "");
  const cardZip = String(draft.card?.zip || "");

  const cardNumberMeta = useMemo(() => sanitizeCardNumberInput(cardNumber), [cardNumber]);
  const cardBrand = cardNumberMeta.brand;
  const cardNumberFormatted = cardNumberMeta.formatted;

  const acceptedCardBrands = ["visa", "mastercard", "amex", "discover"];

  const cardBrandLabel =
    cardBrand === "visa"
      ? t.cardTypeVisa
      : cardBrand === "mastercard"
      ? t.cardTypeMastercard
      : cardBrand === "amex"
      ? t.cardTypeAmex
      : cardBrand === "discover"
      ? t.cardTypeDiscover
      : t.cardTypeUnknown;

  // Draft setter: setDraftPaymentMethod
  function setDraftPaymentMethod(value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => ({
      ...normalizeCheckoutDraft(prev),
      paymentMethod: value === "paypal" || value === "whatsapp" ? "paypal" : "card",
    }));
  }

  // Draft setter: setDraftCustomerField
  function setDraftCustomerField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, customer: { ...base.customer, [field]: value } };
    });
  }

  // Draft setter: setDraftShippingField
  function setDraftShippingField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, shipping: { ...base.shipping, [field]: value } };
    });
  }

  // Draft setter: setDraftCardField
  function setDraftCardField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, card: { ...base.card, [field]: value } };
    });
  }

  // Validation: validateCustomerAndShipping
  function validateCustomerAndShipping() {
    const looksLikeEmail = (value) => {
      const s = String(value || "").trim();
      if (!s) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    };

    const customerOk = name.trim() && phone.trim() && looksLikeEmail(email);
    const shippingOk = addressLine1.trim() && city.trim();
    return Boolean(customerOk && shippingOk);
  }

  // handleGoToReview (Card)
  function handleGoToReview(e) {
    e.preventDefault();
    setCardMessage("");
    setPaymentMessage("");

    const cardOk =
      cardName.trim() &&
      cardNumber.trim() &&
      cardExpiry.trim() &&
      cardCvc.trim() &&
      cardZip.trim();

    if (!validateCustomerAndShipping()) {
      setCardMessage(t.checkoutDetailsRequired);
      return;
    }

    if (!cardOk) {
      setCardMessage(t.cardRequired);
      return;
    }

    if (typeof onGoReview === "function") {
      onGoReview();
    }
  }


  // handlePayPalContinue
  function handlePayPalContinue() {
    setPaymentMessage("");

    if (!validateCustomerAndShipping()) {
      setPaymentMessage(t.checkoutDetailsRequired);
      return;
    }

    if (typeof onGoReview === "function") {
      onGoReview();
    }
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA] p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.checkoutTitle} subtitle={t.checkoutSubtitle} />
          <div className="text-lg font-bold text-[#2B2B2B]">{money(grandTotal, language)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.yourDetails}</div>
            <div className="mt-4 grid gap-3">
              <input
                value={name}
                onChange={(e) => setDraftCustomerField("name", e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                value={phone}
                onChange={(e) => setDraftCustomerField("phone", e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setDraftCustomerField("email", e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.giftNoteLabel}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setDraftCustomerField("notes", e.target.value)}
                  placeholder={t.giftNotePlaceholder}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <div className="mt-1 text-[11px] text-zinc-500">{t.giftNoteHint}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.shippingTitle}</div>
              <div className="mt-1 text-xs leading-5 text-zinc-600">{t.shippingSubtitle}</div>

              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.addressLine1Label}
                  </label>
                  <input
                    value={addressLine1}
                    onChange={(e) => setDraftShippingField("addressLine1", e.target.value)}
                    placeholder={t.addressLine1Placeholder}
                    autoComplete="shipping address-line1"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.addressLine2Label}
                  </label>
                  <input
                    value={addressLine2}
                    onChange={(e) => setDraftShippingField("addressLine2", e.target.value)}
                    placeholder={t.addressLine2Placeholder}
                    autoComplete="shipping address-line2"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.cityLabel}
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setDraftShippingField("city", e.target.value)}
                      placeholder={t.cityPlaceholder}
                      autoComplete="shipping address-level2"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.stateLabel}
                    </label>
                    <input
                      value={stateRegion}
                      onChange={(e) => setDraftShippingField("stateRegion", e.target.value)}
                      placeholder={t.statePlaceholder}
                      autoComplete="shipping address-level1"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.postalLabel}
                    </label>
                    <input
                      value={postalCode}
                      onChange={(e) => setDraftShippingField("postalCode", e.target.value)}
                      placeholder={t.postalPlaceholder}
                      inputMode="numeric"
                      autoComplete="shipping postal-code"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.countryLabel}
                    </label>
                    <input
                      value={country}
                      onChange={(e) => setDraftShippingField("country", e.target.value)}
                      placeholder={t.countryPlaceholder}
                      autoComplete="shipping country"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.checkoutPaymentTitle}</div>
              <div className="mt-1 text-xs leading-5 text-zinc-600">
                {t.checkoutPaymentSubtitle}
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-zinc-700">{t.paymentMethod}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftPaymentMethod("paypal")}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      paymentMethod === "paypal"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="inline-flex items-center">
                      <span className="sr-only">{t.payByPayPal}</span>
                      <PayPalLogo className="h-6 w-6" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftPaymentMethod("card")}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      paymentMethod === "card"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="6"
                          width="18"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>{t.payByCard}</span>
                    </span>
                  </button>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-zinc-600">{t.cardAcceptedLabel}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {acceptedCardBrands.map((b) => (
                      <CreditCardBrandLogo
                        key={b}
                        brand={b}
                        active={paymentMethod === "card" && cardBrand === b}
                      />
                    ))}
                  </div>
                </div>

                {paymentMessage ? (
                  <div className="mt-2 text-xs font-semibold text-amber-700">
                    {paymentMessage}
                  </div>
                ) : null}
              </div>

              {paymentMethod === "paypal" ? (
                <div className="mt-4 grid gap-3">
                  <Button variant="primary" onClick={handlePayPalContinue} className="w-full">
                    {t.sendWhatsApp}
                  </Button>
                  <div className="text-xs leading-5 text-zinc-500">{t.payPalDisclaimer}</div>
                </div>
              ) : (
                <form onSubmit={handleGoToReview} className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.cardNameLabel}
                  </label>
                  <input
                    value={cardName}
                    onChange={(e) => setDraftCardField("name", e.target.value)}
                    placeholder={t.cardNamePlaceholder}
                    autoComplete="cc-name"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.cardNumberLabel}</label>
                  <input
                    value={cardNumberFormatted}
                    onChange={(e) => {
                      const next = sanitizeCardNumberInput(e.target.value);
                      setDraftCardField("number", next.formatted);
                    }}
                    placeholder={t.cardNumberPlaceholder}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                  <div className="mt-2 text-xs text-zinc-600">
                    {t.cardTypeLabel}: <span className="font-semibold">{cardBrandLabel}</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardExpiryLabel}</label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => setDraftCardField("expiry", sanitizeExpiryInput(e.target.value))}
                      placeholder={t.cardExpiryPlaceholder}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardCvcLabel}</label>
                    <input
                      value={cardCvc}
                      onChange={(e) => setDraftCardField("cvc", sanitizeCvcInput(e.target.value, cardBrand))}
                      placeholder={cardBrand === "amex" ? "1234" : t.cardCvcPlaceholder}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={cardBrand === "amex" ? 4 : 3}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardZipLabel}</label>
                    <input
                      value={cardZip}
                      onChange={(e) => setDraftCardField("zip", e.target.value)}
                      placeholder={t.cardZipPlaceholder}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <Button variant="primary" className="w-full">
                  {t.payNow}
                </Button>

                <div className="text-xs leading-5 text-zinc-500">{t.cardDisclaimer}</div>

                {cardMessage ? (
                  <div className="text-xs font-semibold text-amber-700">
                    {cardMessage}
                  </div>
                ) : null}
                </form>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onBack}>
                {t.backToCart}
              </Button>
            </div>

            <div className="mt-3 text-xs leading-5 text-zinc-500">{t.nextStep}</div>
          </div>

          <div>
            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.summary}</div>
              <div className="mt-4 grid gap-3">
                {cart.map((it) => (
                  <div key={it.key} className="rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">
                          {it.category}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {l10n(it.name, language)}
                        </div>
                        <div className="mt-2 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization.text || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization.verse}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-zinc-900">
                        {money(it.price, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold text-zinc-700">{t.checkoutSubtotal}</div>
                    <div className="font-bold text-zinc-900">{money(subtotal, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxStateAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxMunicipalAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold text-zinc-700">
                      {t.taxPrTotal} ({formatRatePct(taxRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                    <div className="font-bold text-zinc-900">{money(shippingFeeAmount, language)}</div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-[#DDD6CA]/60 pt-3 text-base">
                    <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                    <div className="text-lg font-extrabold text-zinc-900">
                      {money(grandTotal, language)}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500">{t.checkoutEditTaxesShippingHint}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 text-sm text-[#6B6B6B] shadow-sm backdrop-blur-xl">
                {t.checkoutCompleteHint}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: CheckoutReview
function CheckoutReview({
  cart,
  checkoutConfig,
  checkoutDraft,
  setCheckoutDraft,
  policiesConfig,
  onGoPolicies,
  onBack,
  onRemove,
  onPlaceOrder,
  serverPublicOk,
  onGetPayPalConfig,
  onPayPalCreateOrder,
  onPayPalCaptureOrder,
  notify,
  t,
  language,
}) {
  const cfg = useMemo(() => normalizeCheckoutConfig(checkoutConfig), [checkoutConfig]);
  const draft = useMemo(() => normalizeCheckoutDraft(checkoutDraft), [checkoutDraft]);

  const subtotal = Array.isArray(cart) ? cart.reduce((acc, it) => acc + it.price * it.qty, 0) : 0;

  const taxStateRate = Math.max(0, parseNumberOr(cfg.prTaxStateRatePct, PR_TAX_STATE_RATE_PCT));
  const taxMunicipalRate = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, PR_TAX_MUNICIPAL_RATE_PCT)
  );

  const shippingFeeAmount = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);
  const taxRate = roundMoney(taxStateRate + taxMunicipalRate);

  const grandTotal = roundMoney(subtotal + taxAmount + shippingFeeAmount);

  const [message, setMessage] = useState("");
  const [submitToken, setSubmitToken] = useState(0);

  const isPayPal = draft.paymentMethod === "paypal";

  const paypalContainerRef = useRef(null);
  const paypalButtonsRef = useRef(null);

  const [paypalMessage, setPayPalMessage] = useState("");
  const [paypalBusy, setPayPalBusy] = useState(false);

  const buildPayPalPayload = useCallback(() => {
    const items = (Array.isArray(cart) ? cart : [])
      .map((it) => ({
        productId: String(it?.id ?? "").trim(),
        qty: Number(it?.qty) || 0,
        name: it?.name,
        category: it?.category,
        personalization: it?.personalization,
      }))
      .filter((it) => it.productId && it.qty > 0);

    const customer = {
      name: String(draft.customer?.name || "").trim(),
      phone: String(draft.customer?.phone || "").trim(),
      email: String(draft.customer?.email || "").trim(),
      notes: String(draft.customer?.notes || "").trim(),
    };

    const shipping = {
      addressLine1: String(draft.shipping?.addressLine1 || "").trim(),
      addressLine2: String(draft.shipping?.addressLine2 || "").trim(),
      city: String(draft.shipping?.city || "").trim(),
      stateRegion: String(draft.shipping?.stateRegion || "").trim(),
      postalCode: String(draft.shipping?.postalCode || "").trim(),
      country: String(draft.shipping?.country || "").trim(),
    };

    return { items, customer, shipping };
  }, [cart, draft]);

  const validateDraft = useCallback(() => {
    const looksLikeEmail = (value) => {
      const s = String(value || "").trim();
      if (!s) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    };

    const customerOk =
      String(draft?.customer?.name || "").trim() &&
      String(draft?.customer?.phone || "").trim() &&
      looksLikeEmail(draft?.customer?.email);

    const shippingOk =
      String(draft?.shipping?.addressLine1 || "").trim() &&
      String(draft?.shipping?.city || "").trim();

    return Boolean(customerOk && shippingOk);
  }, [draft]);

  useEffect(() => {
    if (!submitToken) return;
    const timer = window.setTimeout(() => setSubmitToken(0), 2000);
    return () => window.clearTimeout(timer);
  }, [submitToken]);

  // PayPal Buttons rendering (review step)
  useEffect(() => {
    let cancelled = false;

    const clearContainer = () => {
      const el = paypalContainerRef.current;
      if (el && typeof el === "object") {
        try {
          el.innerHTML = "";
        } catch {
          // ignore
        }
      }
    };

    (async () => {
      clearContainer();
      paypalButtonsRef.current = null;
      setPayPalMessage("");

      if (!isPayPal) return;

      if (!serverPublicOk) {
        setPayPalMessage(
          language === "es"
            ? "PayPal requiere que el Backend esté encendido."
            : "PayPal requires the backend server to be running."
        );
        return;
      }

      if (!validateDraft()) return;
      if (!draft.acceptPolicies) return;

      const payload = buildPayPalPayload();
      if (!payload.items.length) {
        setPayPalMessage(t.emptyCart);
        return;
      }

      if (typeof onGetPayPalConfig !== "function") {
        setPayPalMessage(language === "es" ? "PayPal no está disponible." : "PayPal is not available.");
        return;
      }

      let cfg = null;
      try {
        cfg = await onGetPayPalConfig();
      } catch {
        cfg = null;
      }

      const configured = Boolean(cfg && typeof cfg === "object" && cfg.configured);
      const clientId = configured ? String(cfg.clientId || "").trim() : "";
      const currency = configured ? String(cfg.currency || "USD").trim().toUpperCase() : "USD";

      if (!configured || !clientId) {
        setPayPalMessage(
          language === "es"
            ? "PayPal no está configurado en el servidor."
            : "PayPal is not configured on the server."
        );
        return;
      }

      let paypal = null;
      try {
        paypal = await loadPayPalSdk({ clientId, currency });
      } catch {
        setPayPalMessage(language === "es" ? "No se pudo cargar PayPal." : "Could not load PayPal.");
        return;
      }

      if (cancelled) return;

      if (!paypal || typeof paypal.Buttons !== "function") {
        setPayPalMessage(language === "es" ? "PayPal no está disponible." : "PayPal is not available.");
        return;
      }

      const container = paypalContainerRef.current;
      if (!container) return;
      clearContainer();

      const buttons = paypal.Buttons({
        style: { layout: "vertical" },

        createOrder: async () => {
          if (typeof onPayPalCreateOrder !== "function") {
            throw new Error("missing_create_order_handler");
          }

          const p = buildPayPalPayload();
          const res = await onPayPalCreateOrder(p);
          const oid = res && typeof res === "object" ? String(res.paypalOrderId || "").trim() : "";
          if (!oid) throw new Error("missing_paypal_order_id");
          return oid;
        },

        onApprove: async (data) => {
          if (typeof onPayPalCaptureOrder !== "function") {
            setPayPalMessage(language === "es" ? "No se pudo completar PayPal." : "Could not complete PayPal.");
            return;
          }

          const oid = data && typeof data === "object" ? String(data.orderID || "").trim() : "";
          if (!oid) {
            setPayPalMessage(language === "es" ? "PayPal: orderID inválido." : "PayPal: invalid orderID.");
            return;
          }

          setPayPalBusy(true);
          setPayPalMessage("");

          try {
            const p = buildPayPalPayload();
            await onPayPalCaptureOrder({ paypalOrderId: oid, ...p });
          } catch {
            setPayPalMessage(language === "es" ? "No se pudo capturar el pago." : "Could not capture payment.");
          } finally {
            if (!cancelled) setPayPalBusy(false);
          }
        },

        onError: () => {
          setPayPalMessage(language === "es" ? "Error de PayPal." : "PayPal error.");
        },
      });

      paypalButtonsRef.current = buttons;

      try {
        await buttons.render(container);
      } catch {
        setPayPalMessage(language === "es" ? "No se pudo mostrar PayPal." : "Could not render PayPal.");
      }
    })();

    return () => {
      cancelled = true;
      try {
        const inst = paypalButtonsRef.current;
        if (inst && typeof inst.close === "function") inst.close();
        if (inst && typeof inst.destroy === "function") inst.destroy();
      } catch {
        // ignore
      }
      paypalButtonsRef.current = null;
      clearContainer();
    };
  }, [
    isPayPal,
    serverPublicOk,
    buildPayPalPayload,
    validateDraft,
    draft.acceptPolicies,
    language,
    t.emptyCart,
    onGetPayPalConfig,
    onPayPalCreateOrder,
    onPayPalCaptureOrder,
  ]);

  function setDraftAcceptPolicies(value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => ({
      ...normalizeCheckoutDraft(prev),
      acceptPolicies: Boolean(value),
    }));
  }

  const policiesNormalized = normalizePoliciesConfig(policiesConfig);
  const policyCategories = Array.isArray(policiesNormalized?.categories) ? policiesNormalized.categories : [];

  const publishedPolicies = policyCategories
    .map((c, idx) => {
      const id = String(c?.id ?? idx).trim();
      const name = String(c?.name || "").trim();
      const content = String(c?.content || "");
      return { id, name, content };
    })
    .filter((c) => c.id && c.name && c.content.trim());

  // Action: submitOrder (shows toast then calls onPlaceOrder)
  function submitOrder() {
    setMessage("");

    if (!Array.isArray(cart) || cart.length === 0) {
      setMessage(t.emptyCart);
      return;
    }

    if (draft.paymentMethod !== "card" && draft.paymentMethod !== "paypal") {
      setMessage(t.checkoutDetailsRequired);
      return;
    }

    if (!validateDraft()) {
      setMessage(t.checkoutDetailsRequired);
      return;
    }

    if (!draft.acceptPolicies) {
      setMessage(t.checkoutPoliciesRequired);
      return;
    }

    // PayPal is processed via the PayPal button (create + approve + capture).
    if (draft.paymentMethod === "paypal") {
      setMessage(t.payPalDisclaimer);
      return;
    }

    setSubmitToken(Date.now());

    if (typeof notify === "function") {
      notify(t.checkoutOrderSubmittedToast, "success");
    }

    window.setTimeout(() => {
      if (typeof onPlaceOrder !== "function") return;

      onPlaceOrder({
        customer: {
          name: String(draft.customer?.name || "").trim(),
          phone: String(draft.customer?.phone || "").trim(),
          email: String(draft.customer?.email || "").trim(),
          notes: String(draft.customer?.notes || "").trim(),
        },
        shipping: {
          addressLine1: String(draft.shipping?.addressLine1 || "").trim(),
          addressLine2: String(draft.shipping?.addressLine2 || "").trim(),
          city: String(draft.shipping?.city || "").trim(),
          stateRegion: String(draft.shipping?.stateRegion || "").trim(),
          postalCode: String(draft.shipping?.postalCode || "").trim(),
          country: String(draft.shipping?.country || "").trim(),
        },
        paymentMethod: draft.paymentMethod,
        taxRatePct: taxRate,
        taxStateRatePct: taxStateRate,
        taxMunicipalRatePct: taxMunicipalRate,
        shippingFee: shippingFeeAmount,
      });
    }, 900);
  }

  const shipLines = [
    draft?.shipping?.addressLine1,
    draft?.shipping?.addressLine2,
    [draft?.shipping?.city, draft?.shipping?.stateRegion].filter(Boolean).join(", "),
    draft?.shipping?.postalCode,
    draft?.shipping?.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA] p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.checkoutReviewTitle} subtitle={t.checkoutReviewSubtitle} />
          <div className="text-lg font-bold text-[#2B2B2B]">{money(grandTotal, language)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.yourDetails}</div>
              <div className="mt-2 text-sm font-extrabold text-zinc-900">
                {String(draft?.customer?.name || "").trim() || "—"}
              </div>
              <div className="mt-1 text-xs text-zinc-600">
                {String(draft?.customer?.phone || "").trim() || "—"}
              </div>
              <div className="mt-1 text-xs text-zinc-600">
                {String(draft?.customer?.email || "").trim() || "—"}
              </div>
              {String(draft?.customer?.notes || "").trim() ? (
                <div className="mt-3 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-[11px] font-semibold text-zinc-500">{t.giftNoteLabel}</div>
                  <div className="mt-2 text-xs leading-5 text-zinc-700">{String(draft.customer.notes)}</div>
                </div>
              ) : null}

              <div className="mt-6 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.shippingTitle}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                  {shipLines || "—"}
                </pre>
              </div>

              {/* Policies acceptance */}
              <div className="mt-4 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{t.checkoutPoliciesTitle}</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-600">{t.checkoutPoliciesSubtitle}</div>
                  </div>

                  {typeof onGoPolicies === "function" ? (
                    <button
                      type="button"
                      onClick={onGoPolicies}
                      className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50"
                    >
                      {t.checkoutPoliciesViewLink}
                    </button>
                  ) : null}
                </div>

                {publishedPolicies.length ? (
                  <div className="mt-3 grid gap-2">
                    {publishedPolicies.map((p) => (
                      <details
                        key={p.id}
                        className="rounded-2xl border border-[#DDD6CA]/60 bg-white/55 px-4 py-3"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900">
                          <span>{p.name}</span>
                          <span className="text-zinc-500">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-3 max-h-[240px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                          {p.content}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-zinc-600">{t.policiesPublicEmpty}</div>
                )}

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.acceptPolicies)}
                    onChange={(e) => setDraftAcceptPolicies(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-zinc-900">{t.checkoutPoliciesAcceptLabel}</span>
                </label>
              </div>

              {message ? (
                <div className="mt-4 text-xs font-semibold text-amber-700">{message}</div>
              ) : null}

              <div className="mt-6 grid gap-2 md:grid-cols-2">
                <Button variant="secondary" onClick={onBack}>
                  {t.checkoutEditDetails}
                </Button>

                {!isPayPal ? (
                  <div className="w-full">
                    {/* Mobile: slide-to-submit */}
                    <div className="md:hidden">
                      <SlideToSubmit
                        label={t.checkoutSlideToSubmit}
                        disabledLabel={t.checkoutSubmitting}
                        disabled={Boolean(submitToken)}
                        onComplete={submitOrder}
                      />
                    </div>

                    {/* Desktop: keep button */}
                    <div className="hidden md:block">
                      <Button variant="primary" onClick={submitOrder} disabled={Boolean(submitToken)}>
                        {t.checkoutSubmitOrder}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div
                      className={`rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-3 shadow-sm backdrop-blur-xl ${
                        paypalBusy ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <div ref={paypalContainerRef} />
                    </div>

                    {paypalMessage ? (
                      <div className="mt-2 text-xs font-semibold text-amber-700">{paypalMessage}</div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.summary}</div>

              {Array.isArray(cart) && cart.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {cart.map((it) => (
                    <div
                      key={it.key}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">{it.category}</div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {l10n(it.name, language)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization?.text || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization?.verse || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.qty} {Number(it.qty) || 0}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-900">
                          {money((Number(it.price) || 0) * (Number(it.qty) || 0), language)}
                        </div>
                        {typeof onRemove === "function" ? (
                          <div className="mt-2">
                            <Button variant="secondary" onClick={() => onRemove(it.key)}>
                              {t.remove}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 text-sm text-[#6B6B6B] shadow-sm backdrop-blur-xl">
                  {t.emptyCart}
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutSubtotal}</div>
                    <div className="font-semibold text-zinc-900">{money(subtotal, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxStateAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxMunicipalAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrTotal} ({formatRatePct(taxRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                    <div className="font-semibold text-zinc-900">{money(shippingFeeAmount, language)}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-[#DDD6CA]/60 pt-3">
                    <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                    <div className="text-lg font-extrabold text-zinc-900">{money(grandTotal, language)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: OrderConfirmation
function OrderConfirmation({ order, onGoHome, t, language }) {

  const paymentText =
    order?.paymentMethod === "paypal" || order?.paymentMethod === "whatsapp"
      ? t.ordersPaymentPayPal
      : t.ordersPaymentCard;

  const createdLabel =
    typeof order?.createdAt === "number"
      ? new Date(order.createdAt).toLocaleString(language === "es" ? "es-US" : "en-US")
      : "";

  const ship = order?.shipping || {};
  const shipLines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join("\n");

  const items = Array.isArray(order?.items) ? order.items : [];
  const itemsCount = items.reduce((acc, it) => acc + (Number(it?.qty) || 0), 0);

  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : roundMoney(
        items.reduce(
          (acc, it) => acc + (Number(it?.qty) || 0) * (Number(it?.unitPrice) || 0),
          0
        )
      );

  const prTax = getPrTaxBreakdownFromOrder(order, subtotal);
  const shippingFee = Number.isFinite(Number(order?.shippingFee)) ? Number(order.shippingFee) : 0;
  const orderTotal = Number.isFinite(Number(order?.total))
    ? Number(order.total)
    : roundMoney(subtotal + prTax.totalAmount + shippingFee);

  const nextSteps =
    language === "es"
      ? [
          "Guarda tu número de orden por si necesitas ayuda.",
          "Prepararemos tu pedido y te enviaremos el tracking cuando esté listo.",
          "Si deseas hacer cambios, escríbenos con tu número de orden.",
        ]
      : [
          "Save your order number in case you need help.",
          "We'll prepare your order and share tracking once it's ready.",
          "If you need changes, message us with your order number.",
        ];

  // printReceipt
  function printReceipt() {
    if (!order) return;

    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.6in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }
.muted { color: #555; font-size: 12px; }

.receipt { max-width: 760px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.right { text-align: right; }
.orderNo { font-size: 16px; font-weight: 800; }

.brandRow { display: flex; align-items: center; gap: 10px; }
.brandLogo { width: 42px; height: 42px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.card { border: 1px solid #ddd; border-radius: 12px; padding: 12px; }
.cardTitle { font-size: 12px; font-weight: 800; color: #111; margin-bottom: 6px; }
.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
.items th, .items td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.items th { text-align: left; font-size: 12px; color: #333; }
.qty { width: 60px; text-align: right; }
.money { width: 110px; text-align: right; }
.itemName { font-weight: 800; }
.itemMeta { margin-top: 4px; font-size: 12px; color: #555; }
.totalRow { display: flex; justify-content: space-between; margin-top: 14px; font-weight: 900; }
.total { font-size: 18px; }
.footer { margin-top: 16px; }
`;

    openPrintWindow({
      title: `${t.orderConfirmationPrintReceipt} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: buildReceiptHtml({ order, language }),
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA] p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.orderConfirmationTitle} subtitle={t.orderConfirmationSubtitle} />

        {!order ? (
          <div className="rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 text-sm text-[#6B6B6B] shadow-sm backdrop-blur-xl">
            {t.orderConfirmationNotFound}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-900">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>

                  <div>
                    <div className="text-sm font-extrabold text-zinc-900">
                      {language === "es" ? "¡Gracias por tu orden!" : "Thanks for your order!"}
                    </div>
                    {createdLabel ? (
                      <div className="mt-1 text-xs text-zinc-600">
                        {t.ordersPlacedAt}: {createdLabel}
                      </div>
                    ) : null}
                    <div className="mt-3 grid gap-1 text-sm text-zinc-700">
                      <div>
                        <span className="font-semibold text-zinc-900">{t.orderConfirmationOrderNumber}:</span>{" "}
                        {order.orderNumber || order.id}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900">{t.orderConfirmationPaymentMethod}:</span>{" "}
                        {paymentText}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900">{t.ordersItems}:</span> {String(itemsCount)}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900">{t.checkoutGrandTotal}:</span>{" "}
                        {money(orderTotal, language)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-xs font-semibold text-zinc-500">
                    {language === "es" ? "Próximos pasos" : "Next steps"}
                  </div>
                  <ul className="mt-2 grid gap-2 text-sm text-zinc-700">
                    {nextSteps.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                        <span className="leading-5">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    {t.total}: {money(orderTotal, language)}
                  </div>

                  <div className="mt-3 grid gap-1 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">{t.checkoutSubtotal}</div>
                      <div className="font-semibold text-zinc-900">{money(subtotal, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrState} ({formatRatePct(prTax.stateRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.stateAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrMunicipal} ({formatRatePct(prTax.municipalRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.municipalAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrTotal} ({formatRatePct(prTax.totalRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.totalAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                      <div className="font-semibold text-zinc-900">{money(shippingFee, language)}</div>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-[#DDD6CA]/60 pt-2">
                      <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                      <div className="font-extrabold text-zinc-900">{money(orderTotal, language)}</div>
                    </div>
                  </div>

                  {order?.trackingNumber ? (
                    <div className="mt-2 text-xs text-zinc-600">
                      {t.ordersTrackingNumberLabel}: {order.trackingNumber}
                    </div>
                  ) : null}
                  {order?.etaText ? (
                    <div className="mt-1 text-xs text-zinc-600">
                      {t.ordersEtaLabel}: {order.etaText}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="secondary" onClick={printReceipt}>
                    {t.orderConfirmationPrintReceipt}
                  </Button>
                  <Button variant="primary" onClick={onGoHome}>
                    {t.orderConfirmationGoHome}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.ordersCustomer}</div>
                <div className="mt-1 text-sm font-bold text-zinc-900">
                  {order?.customer?.name || "—"}
                </div>
                {order?.customer?.phone ? (
                  <div className="mt-1 text-xs text-zinc-600">{order.customer.phone}</div>
                ) : null}
                {order?.customer?.email ? (
                  <div className="mt-1 text-xs text-zinc-600">{order.customer.email}</div>
                ) : null}
                {order?.customer?.notes ? (
                  <div className="mt-3 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                    <div className="text-[11px] font-semibold text-zinc-500">{t.giftNoteLabel}</div>
                    <div className="mt-2 text-xs leading-5 text-zinc-700">{order.customer.notes}</div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.ordersShipping}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                  {shipLines || "—"}
                </pre>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#DDD6CA]/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.ordersItems}</div>
              <div className="mt-3 grid gap-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[#DDD6CA]/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {l10n(it.name, language)}
                      </div>
                      {it?.personalization?.text ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization.text}
                        </div>
                      ) : null}
                      {it?.personalization?.verse ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization.verse}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900">×{Number(it.qty) || 0}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {money(Number(it.unitPrice) || 0, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: OrderStatus
function OrderStatus({
  orders,
  setOrders,
  notify,
  t,
  language,
  serverPublicOk,
  onLookupOrderStatus,
  onSendCancelRequest,
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");

  const [serverOrder, setServerOrder] = useState(null);
  const [busyLookup, setBusyLookup] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const normalizedQuery = String(searchedOrderNumber || "").trim().toLowerCase();

  const order = useMemo(() => {
    if (!normalizedQuery) return null;

    if (serverPublicOk) {
      return serverOrder && typeof serverOrder === "object" ? serverOrder : null;
    }

    const list = Array.isArray(orders) ? orders : [];
    return (
      list.find((o) => String(o?.orderNumber || "").trim().toLowerCase() === normalizedQuery) || null
    );
  }, [orders, normalizedQuery, serverPublicOk, serverOrder]);

  const status = normalizeOrderStatus(order?.status);
  const statusText = order ? orderStatusLabel(status, t) : "";
  const statusClass = order ? orderStatusBadgeClass(status) : "";

  const trackingSteps = [
    { key: "received", label: t.orderTrackingStepReceived },
    { key: "in_production", label: t.orderTrackingStepInProduction },
    { key: "shipped", label: t.orderTrackingStepShipped },
    { key: "delivered", label: t.orderTrackingStepDelivered },
  ];

  const trackingIndex =
    status === "delivered"
      ? 4
      : status === "shipped"
      ? 3
      : status === "preparing" || status === "paused"
      ? 2
      : status === "pending"
      ? 1
      : 0;

  const updatedAtMs =
    typeof order?.statusUpdatedAt === "number"
      ? order.statusUpdatedAt
      : typeof order?.updatedAt === "number"
      ? order.updatedAt
      : typeof order?.createdAt === "number"
      ? order.createdAt
      : null;

  const updatedAtLabel =
    updatedAtMs != null
      ? new Date(updatedAtMs).toLocaleString(language === "es" ? "es-US" : "en-US")
      : "";

  const cancelRequested =
    Boolean(order?.customerCancelRequestedAt) && Boolean(order?.customerCancelRequestReason);

  const canRequestCancel = Boolean(order) && isOpenOrderStatus(status) && !cancelRequested;

  // Handler: submitLookup
  async function submitLookup(e) {
    e.preventDefault();

    const q = orderNumber.trim();
    setSearchedOrderNumber(q);

    if (!q) {
      setServerOrder(null);
      return;
    }

    if (serverPublicOk && typeof onLookupOrderStatus === "function") {
      setBusyLookup(true);
      try {
        const o = await onLookupOrderStatus(q);
        setServerOrder(o && typeof o === "object" ? o : null);
      } finally {
        setBusyLookup(false);
      }
    }
  }

  // Handler: sendCancelRequest
  async function sendCancelRequest() {
    const reason = cancelReason.trim();
    if (!order || !reason) return;

    // Prefer backend cancel request so it syncs across devices.
    if (serverPublicOk && typeof onSendCancelRequest === "function") {
      try {
        await onSendCancelRequest({ orderNumber: String(order?.orderNumber || "").trim(), reason });

        // Update the local view immediately.
        setServerOrder((prev) =>
          prev && typeof prev === "object"
            ? {
                ...prev,
                customerCancelRequestReason: reason,
                customerCancelRequestedAt: Date.now(),
                updatedAt: Date.now(),
              }
            : prev
        );

        setCancelReason("");
        setShowCancelModal(false);

        if (typeof notify === "function") {
          notify(t.orderStatusCancelRequestSent, "success");
        }
        return;
      } catch {
        // fall back to local-only below
      }
    }

    if (typeof setOrders !== "function") return;

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.map((o) => {
        if (o?.id !== order.id) return o;
        return {
          ...o,
          customerCancelRequestReason: reason,
          customerCancelRequestedAt: Date.now(),
          updatedAt: Date.now(),
        };
      });
    });

    setCancelReason("");
    setShowCancelModal(false);

    if (typeof notify === "function") {
      notify(t.orderStatusCancelRequestSent, "success");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.orderStatusTitle} subtitle={t.orderStatusSubtitle} />

        <form onSubmit={submitLookup} className="grid gap-3 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-zinc-700">
              {t.orderStatusOrderNumberLabel}
            </label>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={t.orderStatusOrderNumberPlaceholder}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <Button variant="primary" className="w-full" disabled={busyLookup}>
            {t.orderStatusLookup}
          </Button>
        </form>

        {!normalizedQuery ? null : !order ? (
          <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.orderStatusNotFound}
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">{t.orderConfirmationOrderNumber}</div>
                  <div className="mt-1 text-sm font-extrabold text-zinc-900">
                    {order.orderNumber || order.id}
                  </div>

                  {updatedAtLabel ? (
                    <div className="mt-2 text-xs text-zinc-600">
                      {t.orderStatusUpdatedAt}: {updatedAtLabel}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-zinc-500">{t.orderStatusCurrentStatus}</div>
                  <div className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {statusText}
                  </div>
                </div>
              </div>

              {status !== "cancelled" ? (
                <div className="mt-5">
                  <div className="text-xs font-semibold text-zinc-500">{t.orderTrackingTitle}</div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {trackingSteps.map((s, idx) => {
                      const stepNumber = idx + 1;
                      const isComplete = trackingIndex >= stepNumber;
                      const isActive = trackingIndex === stepNumber;

                      return (
                        <div key={s.key} className="flex flex-1 flex-col items-center">
                          <div className="flex w-full items-center">
                            <div
                              className={`h-7 w-7 shrink-0 rounded-full border-2 text-[11px] font-extrabold ${
                                isComplete
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : isActive
                                  ? "border-zinc-900 bg-white text-zinc-900"
                                  : "border-zinc-200 bg-white text-zinc-400"
                              }`}
                              style={{ display: "grid", placeItems: "center" }}
                            >
                              {stepNumber}
                            </div>

                            {idx < trackingSteps.length - 1 ? (
                              <div
                                className={`mx-2 h-[2px] w-full rounded ${
                                  trackingIndex >= stepNumber + 1 ? "bg-zinc-900" : "bg-zinc-200"
                                }`}
                              />
                            ) : null}
                          </div>

                          <div
                            className={`mt-2 text-center text-[11px] font-semibold ${
                              isComplete || isActive ? "text-zinc-800" : "text-zinc-400"
                            }`}
                          >
                            {s.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {(status === "shipped" || status === "delivered") && order?.trackingNumber ? (
                <div className="mt-3 text-sm text-zinc-700">
                  <span className="font-semibold">{t.orderStatusTracking}:</span> {order.trackingNumber}
                </div>
              ) : null}

              {order?.etaText ? (
                <div className="mt-1 text-sm text-zinc-700">
                  <span className="font-semibold">{t.orderStatusEta}:</span> {order.etaText}
                </div>
              ) : null}

              {status === "cancelled" && order?.cancelReason ? (
                <div className="mt-3 text-sm text-zinc-700">
                  <span className="font-semibold">{t.ordersCancelReasonLabel}:</span> {order.cancelReason}
                </div>
              ) : null}

              {cancelRequested ? (
                <div className="mt-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-700 shadow-sm backdrop-blur-xl">
                  <div className="text-xs font-semibold text-zinc-500">{t.orderStatusCancelRequestTitle}</div>
                  <div className="mt-2">
                    {order?.customerCancelRequestReason}
                  </div>
                </div>
              ) : null}
            </div>

            {canRequestCancel ? (
              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <Button
                  variant="primary"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setShowCancelModal(true);
                  }}
                >
                  {t.orderStatusRequestCancelButton}
                </Button>
              </div>
            ) : null}

            {canRequestCancel && showCancelModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-xl rounded-[24px] border border-zinc-200 bg-white p-5 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900">
                        {t.orderStatusRequestCancelButton}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {t.orderStatusCancelRequestReasonLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                    >
                      {t.orderStatusCancelModalClose}
                    </button>
                  </div>

                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                    placeholder={t.orderStatusCancelRequestReasonPlaceholder}
                    className="mt-4 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                      {t.orderStatusCancelModalClose}
                    </Button>
                    <Button variant="primary" onClick={sendCancelRequest} disabled={!cancelReason.trim()}>
                      {t.orderStatusSendCancelRequest}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: Blog
function Blog({ t, language }) {
  const posts = [
    {
      title: {
        es: "Cómo empezar un journal de oración",
        en: "How to start a prayer journal",
      },
      excerpt: {
        es: "Una estructura simple de 10 minutos al día para crecer en fe y constancia.",
        en: "A simple 10-minute daily structure to grow in faith and consistency.",
      },
    },
    {
      title: {
        es: "3 maneras de regalar con propósito",
        en: "3 ways to gift with purpose",
      },
      excerpt: {
        es: "Ideas para personalizar un Yeti o un journal y bendecir a alguien.",
        en: "Ideas to customize a Yeti or a journal and bless someone.",
      },
    },
    {
      title: {
        es: "Identidad: cuando te sientes inestable",
        en: "Identity: when you feel unstable",
      },
      excerpt: {
        es: "Una lectura corta para recordar quién eres y cómo volver a la calma.",
        en: "A short read to remember who you are and how to return to calm.",
      },
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.blogTitle} subtitle={t.blogSubtitle} />
        <div className="grid gap-3 md:grid-cols-3">
          {posts.map((p, idx) => (
            <div
              key={`${l10n(p.title, "en") || l10n(p.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
            >
              <div className="text-sm font-bold text-zinc-900">
                {l10n(p.title, language)}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">
                {l10n(p.excerpt, language)}
              </div>
              <div className="mt-4">
                <Pill>{t.read}</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: About
function About({ t, language }) {
  const values = [
    {
      icon: "faith",
      title: { es: "Fe", en: "Faith" },
      desc: {
        es: "Todo lo que hacemos está fundamentado en la Palabra.",
        en: "Everything we do is grounded in the Word.",
      },
    },
    {
      icon: "integrity",
      title: { es: "Integridad", en: "Integrity" },
      desc: {
        es: "Operamos con transparencia, honestidad y responsabilidad.",
        en: "We operate with transparency, honesty, and accountability.",
      },
    },
    {
      icon: "service",
      title: { es: "Servicio", en: "Service" },
      desc: { es: "Servimos con amor y excelencia.", en: "We serve with love and excellence." },
    },
    {
      icon: "hope",
      title: { es: "Esperanza", en: "Hope" },
      desc: {
        es: "Promovemos mensajes que edifican y transforman vidas.",
        en: "We promote messages that build up and transform lives.",
      },
    },
    {
      icon: "community",
      title: { es: "Comunidad", en: "Community" },
      desc: {
        es: "Fomentamos unidad entre creyentes y quienes buscan.",
        en: "We foster unity among believers and seekers.",
      },
    },
  ];

  function ValuesIcon({ kind, className = "h-5 w-5" }) {
    const common = {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      "aria-hidden": true,
    };

    if (kind === "faith") {
      return (
        <svg {...common}>
          <path d="M12 4v17" />
          <path d="M8 9h8" />
          <path d="M9 21h6" />
        </svg>
      );
    }

    if (kind === "integrity") {
      return (
        <svg {...common}>
          <path d="M12 2 19 5v6c0 5-3 9-7 11C8 20 5 16 5 11V5l7-3Z" />
          <path d="M9.5 11.5 11 13l3.5-4" />
        </svg>
      );
    }

    if (kind === "service") {
      return (
        <svg {...common}>
          <path d="M20 12v10H4V12" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C10 2 12 7 12 7Z" />
          <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C14 2 12 7 12 7Z" />
        </svg>
      );
    }

    if (kind === "hope") {
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
        </svg>
      );
    }

    if (kind === "community") {
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a3 3 0 0 1 0 5.74" />
        </svg>
      );
    }

    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.valuesTitle} subtitle={t.valuesSubtitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {values.map((v, idx) => (
            <div
              key={`${l10n(v.title, "en") || l10n(v.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#355E3B]/10 text-[#355E3B]">
                  <ValuesIcon kind={v.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900">
                    {l10n(v.title, language)}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-600">
                    {l10n(v.desc, language)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#355E3B]/10 text-[#355E3B]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M5 3v18" />
                <path d="M5 4h12l-1 4 1 4H5" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-bold text-zinc-900">{t.missionTitle}</div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{t.missionText}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminPanel
function HeroBenefitsEditor({ heroConfig, setHeroConfig, t, language }) {
  const cfg = normalizeHeroConfig(heroConfig);
  const benefits = Array.isArray(cfg.benefits) ? cfg.benefits : buildDefaultHeroBenefits();

  function setBenefitIcon(index, iconId) {
    if (typeof setHeroConfig !== "function") return;

    setHeroConfig((prev) => {
      const next = normalizeHeroConfig(prev);
      const list = Array.isArray(next.benefits) ? next.benefits : buildDefaultHeroBenefits();
      const cloned = list.map((b) => ({
        ...b,
        title: { ...(b?.title || {}) },
        body: { ...(b?.body || {}) },
      }));

      const candidate = String(iconId || "").trim();
      const safe = HERO_BENEFIT_ICON_BY_ID[candidate] ? candidate : cloned[index]?.iconId;
      cloned[index] = { ...cloned[index], iconId: safe };

      return { ...next, benefits: cloned };
    });
  }

  function setBenefitText(index, field, lang, value) {
    if (typeof setHeroConfig !== "function") return;

    setHeroConfig((prev) => {
      const next = normalizeHeroConfig(prev);
      const list = Array.isArray(next.benefits) ? next.benefits : buildDefaultHeroBenefits();
      const cloned = list.map((b) => ({
        ...b,
        title: { ...(b?.title || {}) },
        body: { ...(b?.body || {}) },
      }));

      const langKey = lang === "en" ? "en" : "es";
      const key = field === "body" ? "body" : "title";
      cloned[index] = {
        ...cloned[index],
        [key]: { ...(cloned[index]?.[key] || {}), [langKey]: value },
      };

      return { ...next, benefits: cloned };
    });
  }

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold text-zinc-900">{t.heroAdminBenefitsTitle}</div>
      <div className="mt-1 text-sm text-zinc-600">{t.heroAdminBenefitsSubtitle}</div>

      <div className="mt-4 grid gap-4">
        {benefits.map((b, idx) => {
          const currentIconId = String(b?.iconId || "").trim();

          return (
            <div key={String(b?.id || idx)} className="rounded-2xl border border-zinc-200 p-4">
              <div className="text-xs font-semibold text-zinc-700">
                {typeof t.heroAdminBenefitN === "function" ? t.heroAdminBenefitN(idx + 1) : `Benefit ${idx + 1}`}
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-zinc-700">{t.heroAdminBenefitIcon}</div>

                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {HERO_BENEFIT_ICON_LIBRARY.map((opt) => {
                      const selected = opt.id === currentIconId;
                      const label = l10n(opt.label, language);

                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setBenefitIcon(idx, opt.id)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[11px] transition ${
                            selected
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                          aria-label={label}
                          title={label}
                        >
                          <span className={selected ? "text-white" : "text-zinc-900"}>
                            <HeroBenefitIcon iconId={opt.id} className="h-5 w-5" strokeWidth={2} />
                          </span>
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.heroAdminBenefitTitle} — {t.heroAdminEs}
                    </label>
                    <input
                      value={b?.title?.es ?? ""}
                      onChange={(e) => setBenefitText(idx, "title", "es", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.heroAdminBenefitTitle} — {t.heroAdminEn}
                    </label>
                    <input
                      value={b?.title?.en ?? ""}
                      onChange={(e) => setBenefitText(idx, "title", "en", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.heroAdminBenefitBody} — {t.heroAdminEs}
                    </label>
                    <input
                      value={b?.body?.es ?? ""}
                      onChange={(e) => setBenefitText(idx, "body", "es", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.heroAdminBenefitBody} — {t.heroAdminEn}
                    </label>
                    <input
                      value={b?.body?.en ?? ""}
                      onChange={(e) => setBenefitText(idx, "body", "en", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold text-zinc-700">{t.preview}</div>
        <div className="mt-3">
          <Hero
            onPrimary={() => {}}
            onSecondary={() => {}}
            t={t}
            heroConfig={cfg}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  categories,
  setCategories,
  products,
  setProducts,
  setInventory,
  setProductCosts,
  orders,
  notify,
  onPreviewProduct,
  activityLog = [],
  onClearActivityLog,
  logActivity,
  onGoOrders,
  onGoInventory,
  onGoCheckout,
  onGoPolicies,
  onGoProducts,
  onGoProfit,
  onGoAdminUsers,
  onLogoutAdmin,
  onGoHomepage,
  currentAdminUser,
  page = "dashboard",
  t,
  language,
}) {
  const fallbackCategory = categories[0] ?? "Yeti";

  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const adminName = String(currentAdminUser?.name || currentAdminUser?.username || "").trim();
  const adminUsername = String(currentAdminUser?.username || "").trim();

  const locale = language === "es" ? "es-PR" : "en-US";
  const now = useMemo(() => new Date(nowTs), [nowTs]);

  let dateText = "";
  let timeText = "";

  try {
    dateText = now.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    timeText = now.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    dateText = now.toDateString();
    timeText = now.toTimeString();
  }

  const [newCategory, setNewCategory] = useState("");

  const [uploading, setUploading] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});


  const ordersList = Array.isArray(orders) ? orders : [];
  const openOrders = ordersList.filter((o) =>
    isOpenOrderStatus(normalizeOrderStatus(o?.status))
  );

  const activityItems = Array.isArray(activityLog) ? activityLog : [];

  function formatActivityTs(ts) {
    const n = Number(ts);
    if (!Number.isFinite(n)) return "";

    const d = new Date(n);
    if (Number.isNaN(d.getTime())) return "";

    try {
      return d.toLocaleString(language === "es" ? "es-PR" : "en-US", {
        year: "2-digit",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d.toLocaleString();
    }
  }

  // handleUploadImage
  async function handleUploadImage({ key, file, filenamePrefix, onSuccess }) {
    if (!file) return;

    setUploadErrors((prev) => ({ ...(prev || {}), [key]: "" }));
    setUploading((prev) => ({ ...(prev || {}), [key]: true }));

    try {
      const filename = buildUploadFilename(filenamePrefix, file);
      const url = await uploadImageToPublicImages({ file, filename });
      onSuccess(url);
    } catch (err) {
      setUploadErrors((prev) => ({
        ...(prev || {}),
        [key]: err?.message || "Upload failed",
      }));
    } finally {
      setUploading((prev) => ({ ...(prev || {}), [key]: false }));
    }
  }

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: fallbackCategory,
    price: "",
    short: "",
    description: "",
    image: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductDraft, setEditingProductDraft] = useState(null);

  function startEditingProduct(product) {
    if (!product?.id) return;

    const id = String(product.id);
    setEditingProductId(id);
    setEditingProductDraft({
      id,
      name: l10n(product.name, language),
      category: String(product.category || fallbackCategory),
      price: String(product.price ?? ""),
      short: l10n(product.short, language),
      description: l10n(product.description, language),
      image: String(product.image || ""),
    });
  }

  function cancelEditingProduct() {
    setEditingProductId(null);
    setEditingProductDraft(null);
  }

  function updateEditingProductDraft(patch) {
    setEditingProductDraft((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      ...(patch && typeof patch === "object" ? patch : {}),
    }));
  }

  function saveEditingProduct() {
    if (typeof setProducts !== "function") return;
    const id = editingProductId;
    const draft = editingProductDraft;
    if (!id || !draft) return;

    const langKey = language === "es" ? "es" : "en";

    const nextName = String(draft.name ?? "").trim();
    const nextShort = String(draft.short ?? "").trim();
    const nextDescription = String(draft.description ?? "").trim();
    const nextImage = String(draft.image ?? "").trim();

    const nextCategoryCandidate = String(draft.category ?? "").trim();
    const nextCategory =
      nextCategoryCandidate && categories.includes(nextCategoryCandidate)
        ? nextCategoryCandidate
        : fallbackCategory;

    const nextPrice = parseNumberOr(draft.price, Number.NaN);
    if (!nextName || !Number.isFinite(nextPrice)) return;

    setProducts((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.map((p) => {
        if (p?.id !== id) return p;

        return {
          ...p,
          category: nextCategory,
          price: Math.max(0, nextPrice),
          image: nextImage || p.image,
          name: { ...(p?.name || {}), [langKey]: nextName },
          short: { ...(p?.short || {}), [langKey]: nextShort },
          description: { ...(p?.description || {}), [langKey]: nextDescription },
        };
      });
    });

    cancelEditingProduct();

    if (typeof notify === "function") {
      notify(t.toastChangesSaved, "success");
    }

    if (typeof logActivity === "function") {
      logActivity({
        kind: "admin",
        messageEs: `Producto actualizado: ${nextName}`,
        messageEn: `Product updated: ${nextName}`,
      });
    }
  }

  function handleDeleteProduct(product) {
    const id = String(product?.id ?? "").trim();
    if (!id || typeof setProducts !== "function") return;

    const displayName = l10n(product?.name, language) || id;
    const confirmText =
      typeof t.confirmDeleteProduct === "function"
        ? t.confirmDeleteProduct(displayName)
        : language === "es"
          ? `¿Eliminar "${displayName}"? Esta acción no se puede deshacer.`
          : `Delete "${displayName}"? This can't be undone.`;

    if (typeof window !== "undefined") {
      const ok = window.confirm(confirmText);
      if (!ok) return;
    }

    setProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p?.id !== id) : []));

    if (typeof notify === "function") {
      if (typeof t.toastProductDeleted === "function") {
        notify(t.toastProductDeleted(displayName), "success");
      } else {
        notify(language === "es" ? "Producto eliminado" : "Product deleted", "success");
      }
    }

    if (typeof logActivity === "function") {
      logActivity({
        kind: "admin",
        messageEs: `Producto eliminado: ${displayName}`,
        messageEn: `Product deleted: ${displayName}`,
      });
    }

    if (typeof setInventory === "function") {
      setInventory((prev) => {
        const next = { ...(prev && typeof prev === "object" ? prev : {}) };
        delete next[id];
        return next;
      });
    }

    if (typeof setProductCosts === "function") {
      setProductCosts((prev) => {
        const next = { ...(prev && typeof prev === "object" ? prev : {}) };
        delete next[id];
        return next;
      });
    }

    if (editingProductId === id) cancelEditingProduct();
  }

  // handleAddCategory
  function handleAddCategory(e) {
    e.preventDefault();

    const candidate = newCategory.trim();
    if (!candidate) return;

    const exists = categories.some(
      (c) => c.trim().toLowerCase() === candidate.toLowerCase()
    );
    if (exists) {
      setNewCategory("");
      return;
    }

    setCategories((prev) => [...prev, candidate]);

    if (typeof notify === "function") {
      if (typeof t.toastCategoryCreated === "function") {
        notify(t.toastCategoryCreated(candidate), "success");
      } else {
        notify(language === "es" ? "Categoría creada" : "Category created", "success");
      }
    }

    if (typeof logActivity === "function") {
      logActivity({
        kind: "admin",
        messageEs: `Categoría creada: ${candidate}`,
        messageEn: `Category created: ${candidate}`,
      });
    }

    // If there were no categories yet, make sure the product form uses this one.
    if (categories.length === 0) {
      setNewProduct((prev) => ({ ...prev, category: candidate }));
    }

    setNewCategory("");
  }


  // handleDeleteCategory
  function handleDeleteCategory(categoryToDelete) {
    if (categories.length <= 1) return;

    const nextCategories = categories.filter((c) => c !== categoryToDelete);
    const nextFallback = nextCategories[0] ?? "Yeti";

    setCategories(nextCategories);

    if (typeof logActivity === "function") {
      logActivity({
        kind: "admin",
        messageEs: `Categoría eliminada: ${categoryToDelete}`,
        messageEn: `Category deleted: ${categoryToDelete}`,
      });
    }

    // Re-assign any products using the deleted category.
    setProducts((prev) =>
      prev.map((p) =>
        p.category === categoryToDelete ? { ...p, category: nextFallback } : p
      )
    );

    // Keep the form in a valid category.
    setNewProduct((prev) => ({
      ...prev,
      category: prev.category === categoryToDelete ? nextFallback : prev.category,
    }));
  }


  // handleNewProductChange
  function handleNewProductChange(e) {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  // handleAddProduct
  function handleAddProduct(e) {
    e.preventDefault();

    const productToAdd = {
      id: crypto.randomUUID(),
      category: newProduct.category,
      name: { es: newProduct.name, en: newProduct.name },
      price: Number(newProduct.price),
      short: { es: newProduct.short, en: newProduct.short },
      description: { es: newProduct.description, en: newProduct.description },
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80",
      tags: [
        { es: "Nuevo", en: "New" },
        { es: "Personalizable", en: "Customizable" },
      ],
    };

    setProducts((prev) => [...prev, productToAdd]);

    if (typeof notify === "function") {
      const displayName = String(newProduct.name || "").trim() || l10n(productToAdd.name, language) || "";
      if (typeof t.toastProductCreated === "function") {
        notify(t.toastProductCreated(displayName || "Producto"), "success");
      } else {
        notify(language === "es" ? "Producto creado" : "Product created", "success");
      }
    }

    if (typeof logActivity === "function") {
      const displayName = String(newProduct.name || "").trim() || l10n(productToAdd.name, language) || "";
      logActivity({
        kind: "admin",
        messageEs: `Producto creado: ${displayName || "Producto"}`,
        messageEn: `Product created: ${displayName || "Product"}`,
      });
    }

    setNewProduct({
      name: "",
      category: categories[0] ?? "Yeti",
      price: "",
      short: "",
      description: "",
      image: "",
    });
  }

  function DashboardIcon({ kind, className = "h-5 w-5" }) {
    const common = {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      "aria-hidden": true,
    };

    if (kind === "products") {
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="M3.3 7.3 12 12l8.7-4.7" />
          <path d="M12 22V12" />
        </svg>
      );
    }

    if (kind === "homepage") {
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
        </svg>
      );
    }

    if (kind === "admin") {
      return (
        <svg {...common}>
          <path d="M12 2 19 5v6c0 5-3 9-7 11C8 20 5 16 5 11V5l7-3Z" />
          <path d="M9.5 11.5 11 13l3.5-4" />
        </svg>
      );
    }

    if (kind === "profit") {
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 13l3-3 4 4 6-7" />
        </svg>
      );
    }

    if (kind === "orders") {
      return (
        <svg {...common}>
          <path d="M21 8V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v1" />
          <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
          <path d="M7 5V3" />
          <path d="M17 5V3" />
          <path d="M3 10h18" />
        </svg>
      );
    }

    if (kind === "inventory") {
      // Shelves / stock icon (distinct from product box)
      return (
        <svg {...common}>
          <path d="M5 4v16" />
          <path d="M19 4v16" />
          <path d="M5 8h14" />
          <path d="M5 12h14" />
          <path d="M5 16h14" />
          <rect x="7" y="9" width="4" height="2" rx="0.5" />
          <rect x="13" y="13" width="4" height="2" rx="0.5" />
        </svg>
      );
    }

    if (kind === "checkout") {
      // Credit card icon (clearer for “Checkout / Payments”)
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h6" />
          <path d="M16 16l1.2 1.2L20 14.5" />
        </svg>
      );
    }

    if (kind === "policies") {
      // File + check (balanced center alignment)
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      );
    }

    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-zinc-500">
            {language === "es" ? "Bienvenido" : "Welcome"}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="text-base font-extrabold text-zinc-900">
              {adminName || (language === "es" ? "Administrador" : "Admin")}
            </div>

            {adminUsername && adminUsername !== adminName ? (
              <div className="text-xs font-semibold text-zinc-500">@{adminUsername}</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 px-5 py-3 shadow-sm backdrop-blur-xl">
          <div className="text-xs font-semibold text-zinc-700">
            {language === "es" ? "Fecha:" : "Date:"} <span className="font-normal text-zinc-600">{dateText}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-zinc-700">
            {language === "es" ? "Hora:" : "Time:"} <span className="font-normal text-zinc-600">{timeText}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle
            title={page === "products" ? t.adminStatProducts : t.adminTitle}
            subtitle={page === "products" ? t.currentProductsSubtitle : t.adminSubtitle}
          />

          {page === "products" ? (
            <Button
              variant="secondary"
              onClick={() => (typeof onGoProducts === "function" ? onGoProducts() : null)}
            >
              {t.back}
            </Button>
          ) : null}
        </div>

        {page === "dashboard" ? (
          <div className="grid items-stretch gap-4 md:grid-cols-4">
            {(() => {
              const tileBase =
                "group h-full rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl transition will-change-transform hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md hover:ring-1 hover:ring-zinc-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30";
              const tileInner = "flex h-full min-h-[248px] flex-col";
              const titleCls = "text-sm font-bold text-zinc-900";
              const iconAreaCls = "mt-5 flex flex-1 items-center justify-center";
              const iconBoxCls =
                "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#355E3B]/10 text-[#355E3B]";
              const footerSpacer = <div className="h-10" aria-hidden="true" />;

              return (
                <>
                  {/* Dashboard card: Products */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoProducts === "function" ? onGoProducts() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.adminStatProducts}</div>

                      <div className={iconAreaCls}>
                        <span className="relative inline-flex">
                          <span className={iconBoxCls}>
                            <DashboardIcon kind="products" className="h-7 w-7" />
                          </span>

                          {products.length > 0 ? (
                            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold leading-none text-white">
                              {products.length > 99 ? "99+" : products.length}
                            </span>
                          ) : null}
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>

                  {/* Dashboard card: Homepage */}
                  <div className={tileBase}>
                    <div className={tileInner}>
                      <div className={titleCls}>{t.adminHomepageTitle}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="homepage" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto pt-4">
                        <Button
                          variant="secondary"
                          onClick={() => (typeof onGoHomepage === "function" ? onGoHomepage() : null)}
                          className="w-full"
                        >
                          {t.edit}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard card: Admin */}
                  <div className={tileBase}>
                    <div className={tileInner}>
                      <div className={titleCls}>{t.adminStatMode}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="admin" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto grid gap-2 pt-4">
                        {typeof onGoAdminUsers === "function" ? (
                          <Button variant="secondary" onClick={onGoAdminUsers} className="w-full">
                            {t.adminManageAccess}
                          </Button>
                        ) : (
                          footerSpacer
                        )}

                        {typeof onLogoutAdmin === "function" ? (
                          <Button variant="secondary" onClick={onLogoutAdmin} className="w-full">
                            {t.adminLogout}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Dashboard card: Profit / Loss */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoProfit === "function" ? onGoProfit() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.profitTitle}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="profit" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>

                  {/* Dashboard card: Orders */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoOrders === "function" ? onGoOrders() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.ordersTitle}</div>

                      <div className={iconAreaCls}>
                        <span className="relative inline-flex">
                          <span className={iconBoxCls}>
                            <DashboardIcon kind="orders" className="h-7 w-7" />
                          </span>

                          {openOrders.length > 0 ? (
                            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold leading-none text-white">
                              {openOrders.length > 99 ? "99+" : openOrders.length}
                            </span>
                          ) : null}
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>

                  {/* Dashboard card: Inventory */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoInventory === "function" ? onGoInventory() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.inventoryTitle}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="inventory" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>

                  {/* Dashboard card: Checkout */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoCheckout === "function" ? onGoCheckout() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.checkoutTitle}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="checkout" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>

                  {/* Dashboard card: Policies */}
                  <button
                    type="button"
                    onClick={() => (typeof onGoPolicies === "function" ? onGoPolicies() : null)}
                    className={`${tileBase} active:scale-[0.99]`}
                  >
                    <div className={tileInner}>
                      <div className={titleCls}>{t.policiesTitle}</div>

                      <div className={iconAreaCls}>
                        <span className={iconBoxCls}>
                          <DashboardIcon kind="policies" className="h-7 w-7" />
                        </span>
                      </div>

                      <div className="mt-auto pt-4">{footerSpacer}</div>
                    </div>
                  </button>
                </>
              );
            })()}
          </div>
        ) : null}

        {page === "dashboard" ? (
        <>
        {/* Admin: Activity log */}
        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <SectionTitle title={t.activityLogTitle} subtitle={t.activityLogSubtitle} />

            <Button
              variant="secondary"
              onClick={() => (typeof onClearActivityLog === "function" ? onClearActivityLog() : null)}
              disabled={!activityItems.length}
            >
              {t.activityLogClear}
            </Button>
          </div>

          {!activityItems.length ? (
            <div className="mt-3 text-sm text-zinc-600">{t.activityLogEmpty}</div>
          ) : (
            <div className="mt-3 grid gap-2">
              {activityItems.slice(0, 25).map((it, idx) => (
                <div
                  key={it?.id || `${it?.ts || "0"}-${idx}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-zinc-900">
                    {language === "es"
                      ? it?.message?.es || it?.message?.en
                      : it?.message?.en || it?.message?.es}
                  </div>
                  <div className="shrink-0 text-xs text-zinc-500">{formatActivityTs(it?.ts)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        ) : null}

        {page === "products" ? (
          <>
        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
          <SectionTitle title={t.categoriesTitle} subtitle={t.categoriesSubtitle} />

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c)}
                  disabled={categories.length <= 1}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t.deleteCategoryAria(c)}
                  title={
                    categories.length <= 1
                      ? t.deleteCategoryTitleMinOne
                      : t.deleteCategoryTitle
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCategory} className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold text-zinc-900">
                {t.newCategoryLabel}
              </label>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t.newCategoryPlaceholder}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            <Button variant="secondary" className="md:mb-[2px]">
              {t.addCategory}
            </Button>
          </form>
        </div>

        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
          <SectionTitle title={t.addProductTitle} subtitle={t.addProductSubtitle} />

          <form onSubmit={handleAddProduct} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productNameLabel}
                </label>
                <input
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  placeholder={t.productNamePlaceholder}
                  required
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productCategoryLabel}
                </label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductChange}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productPriceLabel}
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  placeholder={language === "es" ? "Ej: 35" : "e.g. 35"}
                  required
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productImageLabel}
                </label>
                <input
                  name="image"
                  value={newProduct.image}
                  onChange={handleNewProductChange}
                  placeholder={t.productImagePlaceholder}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />

                <div className="mt-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.uploadImageLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(uploading["newProduct:image"])}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      handleUploadImage({
                        key: "newProduct:image",
                        file,
                        filenamePrefix: "product-new",
                        onSuccess: (url) =>
                          setNewProduct((prev) => ({ ...prev, image: url })),
                      });
                    }}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                  />

                  {uploading["newProduct:image"] ? (
                    <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                  ) : null}

                  {uploadErrors["newProduct:image"] ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      {t.uploadFailed} {uploadErrors["newProduct:image"]}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-900">
                {t.productShortLabel}
              </label>
              <input
                name="short"
                value={newProduct.short}
                onChange={handleNewProductChange}
                placeholder={t.productShortPlaceholder}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-900">
                {t.productDescriptionLabel}
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                placeholder={t.productDescriptionPlaceholder}
                rows={4}
                required
                className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex justify-end">
              <Button variant="primary">
                {t.addProduct}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <SectionTitle
            title={t.currentProductsTitle}
            subtitle={t.currentProductsSubtitle}
          />

          <div className="grid gap-3">
            {products.map((product) => {
              const isEditing = editingProductId === product.id;
              const draft = isEditing ? editingProductDraft : null;

              return (
                <div
                  key={product.id}
                  className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={l10n(product.name, language)}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div>
                        <div className="text-xs font-semibold text-zinc-500">
                          {product.category}
                        </div>

                        <div className="text-sm font-bold text-zinc-900">
                          {l10n(product.name, language)}
                        </div>

                        <div className="mt-1 text-sm text-zinc-600">
                          {l10n(product.short, language)}
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold text-zinc-900">
                        {money(product.price, language)}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => (typeof onPreviewProduct === "function" ? onPreviewProduct(product) : null)}
                        >
                          {t.preview}
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            isEditing ? cancelEditingProduct() : startEditingProduct(product)
                          }
                        >
                          {isEditing ? t.cancel : t.edit}
                        </Button>

                        <Button variant="secondary" onClick={() => handleDeleteProduct(product)}>
                          {t.delete}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            {t.productNameLabel} ({language === "es" ? "ES" : "EN"})
                          </label>
                          <input
                            value={draft?.name ?? ""}
                            onChange={(e) => updateEditingProductDraft({ name: e.target.value })}
                            placeholder={t.productNamePlaceholder}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            {t.productCategoryLabel}
                          </label>
                          <select
                            value={draft?.category ?? fallbackCategory}
                            onChange={(e) => updateEditingProductDraft({ category: e.target.value })}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            {t.productPriceLabel}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft?.price ?? ""}
                            onChange={(e) => updateEditingProductDraft({ price: e.target.value })}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            {t.productImageLabel}
                          </label>
                          <input
                            value={draft?.image ?? ""}
                            onChange={(e) => updateEditingProductDraft({ image: e.target.value })}
                            placeholder={t.productImagePlaceholder}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            {t.uploadImageLabel}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={Boolean(uploading[`productEdit:${product.id}`])}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              handleUploadImage({
                                key: `productEdit:${product.id}`,
                                file,
                                filenamePrefix: `product-${product.id}`,
                                onSuccess: (url) => updateEditingProductDraft({ image: url }),
                              });
                            }}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                          />

                          {uploading[`productEdit:${product.id}`] ? (
                            <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                          ) : null}

                          {uploadErrors[`productEdit:${product.id}`] ? (
                            <div className="mt-1 text-xs font-semibold text-red-600">
                              {t.uploadFailed} {uploadErrors[`productEdit:${product.id}`]}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-700">{t.preview}</label>
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={draft?.image || product.image}
                              alt={l10n(product.name, language)}
                              className="h-14 w-14 rounded-2xl border border-zinc-200 object-cover"
                            />
                            <div className="text-xs text-zinc-600">{draft?.image ? draft.image : product.image}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700">
                          {t.productShortLabel} ({language === "es" ? "ES" : "EN"})
                        </label>
                        <input
                          value={draft?.short ?? ""}
                          onChange={(e) => updateEditingProductDraft({ short: e.target.value })}
                          placeholder={t.productShortPlaceholder}
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700">
                          {t.productDescriptionLabel} ({language === "es" ? "ES" : "EN"})
                        </label>
                        <textarea
                          value={draft?.description ?? ""}
                          onChange={(e) => updateEditingProductDraft({ description: e.target.value })}
                          placeholder={t.productDescriptionPlaceholder}
                          rows={4}
                          className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" onClick={cancelEditingProduct}>
                          {t.cancel}
                        </Button>
                        <Button variant="primary" onClick={saveEditingProduct}>
                          {t.save}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        </>
        ) : null}
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminHomepage
function AdminHomepage({ heroConfig, setHeroConfig, t, language, onBack }) {
  const [uploading, setUploading] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  // setHeroEnabled
  function setHeroEnabled(enabled) {
    setHeroConfig((prev) => ({ ...normalizeHeroConfig(prev), enabled }));
  }

  // setHeroTextField
  function setHeroTextField(field, lang, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      [field]: {
        ...(prev?.[field] || {}),
        [lang]: value,
      },
    }));
  }

  // setHeroImageField
  function setHeroImageField(field, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      images: {
        ...(prev?.images || {}),
        [field]: value,
      },
    }));
  }

  // setHeroPromoType
  function setHeroPromoType(value) {
    const promoType = value === "promo" ? "promo" : "content";
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      promoType,
    }));
  }

  // setHeroPromoScheduleField
  function setHeroPromoScheduleField(field, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      promoSchedule: {
        ...(prev?.promoSchedule || {}),
        [field]: value,
      },
    }));
  }

  // resetHero
  function resetHero() {
    setHeroConfig(buildDefaultHeroConfig());
  }

  // handleUploadImage
  async function handleUploadImage({ key, file, filenamePrefix, onSuccess }) {
    if (!file) return;

    setUploadErrors((prev) => ({ ...(prev || {}), [key]: "" }));
    setUploading((prev) => ({ ...(prev || {}), [key]: true }));

    try {
      const filename = buildUploadFilename(filenamePrefix, file);
      const url = await uploadImageToPublicImages({ file, filename });
      onSuccess(url);
    } catch (err) {
      setUploadErrors((prev) => ({
        ...(prev || {}),
        [key]: err?.message || "Upload failed",
      }));
    } finally {
      setUploading((prev) => ({ ...(prev || {}), [key]: false }));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle title={t.adminHomepageTitle} subtitle={t.adminHomepageSubtitle} />

          <Button
            variant="secondary"
            onClick={() => (typeof onBack === "function" ? onBack() : null)}
          >
            {t.back}
          </Button>
        </div>

        <div className="mt-6">
          <div className="text-sm font-extrabold text-zinc-900">{t.heroAdminTitle}</div>
          <div className="mt-1 text-sm text-zinc-600">{t.heroAdminSubtitle}</div>

          <div className="mt-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <input
                  type="checkbox"
                  checked={Boolean(heroConfig?.enabled)}
                  onChange={(e) => setHeroEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                {t.heroAdminEnabled}
              </label>

              <Button variant="secondary" onClick={resetHero}>
                {t.heroAdminReset}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminTypeLabel}
                </label>
                <select
                  value={heroConfig?.promoType === "promo" ? "promo" : "content"}
                  onChange={(e) => setHeroPromoType(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  <option value="content">{t.heroAdminTypeContent}</option>
                  <option value="promo">{t.heroAdminTypePromo}</option>
                </select>
              </div>

              {heroConfig?.promoType === "promo" ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-bold text-zinc-900">{t.heroAdminScheduleTitle}</div>

                  <div className="mt-3 grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">{t.heroAdminStartLabel}</label>
                        <input
                          type="datetime-local"
                          value={heroConfig?.promoSchedule?.startLocal || ""}
                          onChange={(e) => setHeroPromoScheduleField("startLocal", e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700">{t.heroAdminEndLabel}</label>
                        <input
                          type="datetime-local"
                          value={heroConfig?.promoSchedule?.endLocal || ""}
                          onChange={(e) => setHeroPromoScheduleField("endLocal", e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-zinc-500">
                      {t.heroAdminScheduleHint}
                      {heroConfig?.enabled ? (
                        <>
                          {" · "}
                          {isHeroOverrideActive(heroConfig)
                            ? t.heroAdminStatusActive
                            : t.heroAdminStatusInactive}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminPill} — {t.heroAdminEs}
                  </label>
                  <input
                    value={heroConfig?.pill?.es ?? ""}
                    onChange={(e) => setHeroTextField("pill", "es", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminPill} — {t.heroAdminEn}
                  </label>
                  <input
                    value={heroConfig?.pill?.en ?? ""}
                    onChange={(e) => setHeroTextField("pill", "en", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminTitleOne} — {t.heroAdminEs}
                  </label>
                  <input
                    value={heroConfig?.titleOne?.es ?? ""}
                    onChange={(e) => setHeroTextField("titleOne", "es", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminTitleOne} — {t.heroAdminEn}
                  </label>
                  <input
                    value={heroConfig?.titleOne?.en ?? ""}
                    onChange={(e) => setHeroTextField("titleOne", "en", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminTitleTwo} — {t.heroAdminEs}
                  </label>
                  <input
                    value={heroConfig?.titleTwo?.es ?? ""}
                    onChange={(e) => setHeroTextField("titleTwo", "es", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminTitleTwo} — {t.heroAdminEn}
                  </label>
                  <input
                    value={heroConfig?.titleTwo?.en ?? ""}
                    onChange={(e) => setHeroTextField("titleTwo", "en", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminText} — {t.heroAdminEs}
                  </label>
                  <textarea
                    value={heroConfig?.text?.es ?? ""}
                    onChange={(e) => setHeroTextField("text", "es", e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminText} — {t.heroAdminEn}
                  </label>
                  <textarea
                    value={heroConfig?.text?.en ?? ""}
                    onChange={(e) => setHeroTextField("text", "en", e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminPrimary} — {t.heroAdminEs}
                  </label>
                  <input
                    value={heroConfig?.primary?.es ?? ""}
                    onChange={(e) => setHeroTextField("primary", "es", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminPrimary} — {t.heroAdminEn}
                  </label>
                  <input
                    value={heroConfig?.primary?.en ?? ""}
                    onChange={(e) => setHeroTextField("primary", "en", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminSecondary} — {t.heroAdminEs}
                  </label>
                  <input
                    value={heroConfig?.secondary?.es ?? ""}
                    onChange={(e) => setHeroTextField("secondary", "es", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    {t.heroAdminSecondary} — {t.heroAdminEn}
                  </label>
                  <input
                    value={heroConfig?.secondary?.en ?? ""}
                    onChange={(e) => setHeroTextField("secondary", "en", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <HeroBenefitsEditor
                heroConfig={heroConfig}
                setHeroConfig={setHeroConfig}
                t={t}
                language={language}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">{t.heroAdminHeroImage}</label>
                  <input
                    value={heroConfig?.images?.hero ?? ""}
                    onChange={(e) => setHeroImageField("hero", e.target.value)}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />

                  <div className="mt-2">
                    <label className="text-xs font-semibold text-zinc-700">{t.uploadImageLabel}</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploading["hero:hero"])}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        handleUploadImage({
                          key: "hero:hero",
                          file,
                          filenamePrefix: "hero-hero",
                          onSuccess: (url) => setHeroImageField("hero", url),
                        });
                      }}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                    />

                    {uploading["hero:hero"] ? (
                      <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                    ) : null}

                    {uploadErrors["hero:hero"] ? (
                      <div className="mt-1 text-xs font-semibold text-red-600">
                        {t.uploadFailed} {uploadErrors["hero:hero"]}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900">{t.heroAdminImage1}</label>
                  <input
                    value={heroConfig?.images?.product1 ?? ""}
                    onChange={(e) => setHeroImageField("product1", e.target.value)}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />

                  <div className="mt-2">
                    <label className="text-xs font-semibold text-zinc-700">{t.uploadImageLabel}</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploading["hero:product1"])}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        handleUploadImage({
                          key: "hero:product1",
                          file,
                          filenamePrefix: "hero-product1",
                          onSuccess: (url) => setHeroImageField("product1", url),
                        });
                      }}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                    />

                    {uploading["hero:product1"] ? (
                      <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                    ) : null}

                    {uploadErrors["hero:product1"] ? (
                      <div className="mt-1 text-xs font-semibold text-red-600">
                        {t.uploadFailed} {uploadErrors["hero:product1"]}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900">{t.heroAdminImage2}</label>
                  <input
                    value={heroConfig?.images?.product2 ?? ""}
                    onChange={(e) => setHeroImageField("product2", e.target.value)}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />

                  <div className="mt-2">
                    <label className="text-xs font-semibold text-zinc-700">{t.uploadImageLabel}</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploading["hero:product2"])}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        handleUploadImage({
                          key: "hero:product2",
                          file,
                          filenamePrefix: "hero-product2",
                          onSuccess: (url) => setHeroImageField("product2", url),
                        });
                      }}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                    />

                    {uploading["hero:product2"] ? (
                      <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                    ) : null}

                    {uploadErrors["hero:product2"] ? (
                      <div className="mt-1 text-xs font-semibold text-red-600">
                        {t.uploadFailed} {uploadErrors["hero:product2"]}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminInventory
function AdminInventory({ products = [], inventory, setInventory, productCosts, setProductCosts, t, language, onBack }) {
  const items = Array.isArray(products) ? products : [];

  // getInventoryCount
  function getInventoryCount(productId) {
    const n = Number(inventory?.[productId]);
    return Number.isFinite(n) ? n : 0;
  }

  // setInventoryCount
  function setInventoryCount(productId, value) {
    const n = Number(value);
    if (typeof setInventory !== "function") return;

    setInventory((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [productId]: Number.isFinite(n) ? n : 0,
    }));
  }

  // adjustInventory
  function adjustInventory(productId, delta) {
    setInventoryCount(productId, getInventoryCount(productId) + delta);
  }

  // getUnitCost
  function getUnitCost(productId) {
    const n = Number(productCosts?.[productId]);
    return Number.isFinite(n) ? n : 0;
  }

  // setUnitCost
  function setUnitCost(productId, value) {
    const n = Number(value);
    if (typeof setProductCosts !== "function") return;

    setProductCosts((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [productId]: Number.isFinite(n) ? n : 0,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle title={t.inventoryTitle} subtitle={t.inventorySubtitle} />

          <Button variant="secondary" onClick={() => (typeof onBack === "function" ? onBack() : null)}>
            {t.back}
          </Button>
        </div>

        <div className="mt-6 grid gap-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-[24px] border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={p.image}
                  alt={l10n(p.name, language)}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-500">{p.category}</div>
                  <div className="mt-1 text-sm font-bold text-zinc-900">{l10n(p.name, language)}</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 md:items-end">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.inventoryInStock}</label>
                  <input
                    type="number"
                    value={getInventoryCount(p.id)}
                    onChange={(e) => setInventoryCount(p.id, e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button variant="secondary" onClick={() => adjustInventory(p.id, -1)} className="w-full">
                      {t.inventoryAdjustMinus}
                    </Button>
                    <Button variant="secondary" onClick={() => adjustInventory(p.id, 1)} className="w-full">
                      {t.inventoryAdjustPlus}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.inventoryUnitCost}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={getUnitCost(p.id)}
                    onChange={(e) => setUnitCost(p.id, e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminCheckoutSettings
function AdminCheckoutSettings({ checkoutConfig, setCheckoutConfig, t, language, onBack }) {
  const normalizedCheckoutConfig = normalizeCheckoutConfig(checkoutConfig);

  // setCheckoutConfigField
  function setCheckoutConfigField(field, value) {
    if (typeof setCheckoutConfig !== "function") return;

    setCheckoutConfig((prev) =>
      normalizeCheckoutConfig({
        ...(prev && typeof prev === "object" ? prev : {}),
        [field]: value,
      })
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle
            title={t.adminCheckoutSettingsTitle}
            subtitle={t.adminCheckoutSettingsSubtitle}
          />

          <Button variant="secondary" onClick={() => (typeof onBack === "function" ? onBack() : null)}>
            {t.back}
          </Button>
        </div>

        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutTaxStateRateLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={String(normalizedCheckoutConfig.prTaxStateRatePct)}
                onChange={(e) => setCheckoutConfigField("prTaxStateRatePct", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutTaxMunicipalRateLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={String(normalizedCheckoutConfig.prTaxMunicipalRatePct)}
                onChange={(e) =>
                  setCheckoutConfigField("prTaxMunicipalRatePct", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutDefaultShippingLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder={language === "es" ? "0.00" : "0.00"}
                value={String(normalizedCheckoutConfig.defaultShippingFee)}
                onChange={(e) => setCheckoutConfigField("defaultShippingFee", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <div className="mt-1 text-[11px] text-zinc-500">USD</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            {t.taxPrTotal} ({formatRatePct(
              normalizedCheckoutConfig.prTaxStateRatePct +
                normalizedCheckoutConfig.prTaxMunicipalRatePct
            )}%)
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminPolicies
function AdminPolicies({ policiesConfig, setPoliciesConfig, t, language, onBack }) {
  const normalized = normalizePoliciesConfig(policiesConfig);
  const categories = Array.isArray(normalized.categories) ? normalized.categories : [];

  const [newCategoryName, setNewCategoryName] = useState("");

  const [activeCategoryId, setActiveCategoryId] = useState(
    () => categories[0]?.id || ""
  );

  const selectedId = categories.some((c) => c.id === activeCategoryId)
    ? activeCategoryId
    : categories[0]?.id || "";

  const activeCategory = categories.find((c) => c.id === selectedId) || null;

  function addCategory(e) {
    e.preventDefault();

    const name = String(newCategoryName || "").trim();
    if (!name) return;

    const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : String(Date.now());

    setPoliciesConfig((prev) => {
      const base = normalizePoliciesConfig(prev);
      const list = Array.isArray(base.categories) ? base.categories : [];

      const exists = list.some((c) => String(c?.name || "").trim().toLowerCase() === name.toLowerCase());
      if (exists) return base;

      return {
        ...base,
        categories: [...list, { id, name, content: "" }],
      };
    });

    setActiveCategoryId(id);
    setNewCategoryName("");
  }

  function deleteCategory(categoryId) {
    const id = String(categoryId || "").trim();
    if (!id) return;

    const cat = categories.find((c) => c.id === id);
    const displayName = String(cat?.name || "").trim() || id;

    const confirmText =
      typeof t.policiesConfirmDeleteCategory === "function"
        ? t.policiesConfirmDeleteCategory(displayName)
        : language === "es"
          ? `¿Eliminar la categoría "${displayName}"?`
          : `Delete category "${displayName}"?`;

    if (typeof window !== "undefined") {
      const ok = window.confirm(confirmText);
      if (!ok) return;
    }

    setPoliciesConfig((prev) => {
      const base = normalizePoliciesConfig(prev);
      const list = Array.isArray(base.categories) ? base.categories : [];
      return { ...base, categories: list.filter((c) => c.id !== id) };
    });

    if (selectedId === id) {
      const next = categories.filter((c) => c.id !== id);
      setActiveCategoryId(next[0]?.id || "");
    }
  }

  function updateActiveCategory(patch) {
    if (!activeCategory) return;

    setPoliciesConfig((prev) => {
      const base = normalizePoliciesConfig(prev);
      const list = Array.isArray(base.categories) ? base.categories : [];
      return {
        ...base,
        categories: list.map((c) => (c.id === activeCategory.id ? { ...c, ...patch } : c)),
      };
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle title={t.adminPoliciesTitle} subtitle={t.adminPoliciesSubtitle} />

          <Button variant="secondary" onClick={() => (typeof onBack === "function" ? onBack() : null)}>
            {t.back}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Left: categories */}
          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-extrabold text-zinc-900">{t.policiesCategoriesTitle}</div>
            <div className="mt-1 text-sm text-zinc-600">{t.policiesCategoriesSubtitle}</div>

            <div className="mt-4 grid gap-2">
              {categories.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600">
                  {t.policiesEmptyCategories}
                </div>
              ) : (
                categories.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveCategoryId(c.id)}
                        className={`flex-1 rounded-2xl border px-4 py-2 text-left text-sm font-semibold transition ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white/70 text-zinc-800 hover:bg-white"
                        }`}
                        title={c.name}
                      >
                        {c.name || t.policiesUntitledCategory}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(c.id)}
                        className="rounded-2xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                        aria-label={t.delete}
                        title={t.delete}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={addCategory} className="mt-4 grid gap-2">
              <label className="text-xs font-semibold text-zinc-700">{t.policiesNewCategoryLabel}</label>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t.policiesNewCategoryPlaceholder}
                className="w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <Button variant="secondary" className="w-full">
                {t.policiesAddCategory}
              </Button>
            </form>
          </div>

          {/* Right: editor */}
          <div className="md:col-span-2 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
            {!activeCategory ? (
              <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600">
                {t.policiesSelectCategoryHint}
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.policiesCategoryNameLabel}
                  </label>
                  <input
                    value={activeCategory.name}
                    onChange={(e) => updateActiveCategory({ name: e.target.value })}
                    placeholder={t.policiesCategoryNamePlaceholder}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.policiesCategoryContentLabel}
                  </label>
                  <textarea
                    value={activeCategory.content}
                    onChange={(e) => updateActiveCategory({ content: e.target.value })}
                    placeholder={t.policiesCategoryContentPlaceholder}
                    rows={12}
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm leading-6 outline-none focus:border-zinc-400"
                  />
                  <div className="mt-2 text-xs text-zinc-500">{t.policiesAutosaveHint}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminProfit
function AdminProfit({ products = [], sales, orders, t, language, onBack }) {
  const [profitPeriod, setProfitPeriod] = useState("week");
  const [profitDate, setProfitDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });

  const profitRange = useMemo(() => {
    const base = new Date(`${profitDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) {
      const now = new Date();
      return { startMs: now.getTime(), endMs: now.getTime() };
    }

    if (profitPeriod === "day") {
      const start = new Date(base);
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }

    if (profitPeriod === "month") {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 1);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }

    // week (Mon-Sun)
    const day = base.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = (day + 6) % 7;
    const start = new Date(base);
    start.setDate(start.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }, [profitDate, profitPeriod]);

  const profitStats = useMemo(() => {
    const rows = Array.isArray(sales) ? sales : [];
    const inRange = rows.filter(
      (s) =>
        typeof s?.createdAt === "number" &&
        s.createdAt >= profitRange.startMs &&
        s.createdAt < profitRange.endMs
    );

    let revenue = 0;
    let cogs = 0;
    let units = 0;

    const byProduct = new Map();

    for (const s of inRange) {
      const qty = Number(s.qty) || 0;
      const unitPrice = Number(s.unitPrice) || 0;
      const unitCost = Number(s.unitCost) || 0;
      const productId = String(s.productId ?? "");

      units += qty;
      revenue += qty * unitPrice;
      cogs += qty * unitCost;

      if (!byProduct.has(productId)) {
        byProduct.set(productId, {
          productId,
          units: 0,
          revenue: 0,
          profit: 0,
        });
      }

      const agg = byProduct.get(productId);
      agg.units += qty;
      agg.revenue += qty * unitPrice;
      agg.profit += qty * (unitPrice - unitCost);
    }

    const grossProfit = revenue - cogs;
    const margin = revenue > 0 ? grossProfit / revenue : 0;

    const topProducts = Array.from(byProduct.values())
      .filter((x) => x.productId)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
      .map((x) => {
        const product = products.find((p) => p.id === x.productId);
        return {
          ...x,
          name: product ? l10n(product.name, language) : x.productId,
        };
      });

    return { inRange, revenue, cogs, grossProfit, margin, units, topProducts };
  }, [sales, profitRange, products, language]);

  const taxCollectedStats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let inRangeTax = 0;
    let allTimeTax = 0;

    for (const o of list) {
      const status = o?.status || "pending";
      if (status === "cancelled") continue;

      const createdAt = typeof o?.createdAt === "number" ? o.createdAt : null;
      const prTax = getPrTaxBreakdownFromOrder(o, 0);
      const tax = Number(prTax?.totalAmount) || 0;

      allTimeTax += tax;

      if (createdAt != null && createdAt >= profitRange.startMs && createdAt < profitRange.endMs) {
        inRangeTax += tax;
      }
    }

    return {
      inRange: roundMoney(inRangeTax),
      allTime: roundMoney(allTimeTax),
    };
  }, [orders, profitRange]);

  // printProfitReportPdf
  function printProfitReportPdf() {
    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.7in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }

.report { max-width: 860px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #e5e7eb; }
.brandRow { display: flex; align-items: center; gap: 12px; }
.brandLogo { width: 44px; height: 44px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }
.muted { color: #555; font-size: 12px; }
.meta { font-size: 12px; line-height: 1.55; }
.label { font-weight: 800; color: #111; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
.card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 12px; }
.cardLabel { font-size: 12px; color: #555; font-weight: 700; }
.cardValue { margin-top: 6px; font-size: 16px; font-weight: 900; }

.section { margin-top: 18px; }
.sectionTitle { font-size: 14px; font-weight: 900; margin-bottom: 8px; }

.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.table th { text-align: left; font-size: 12px; color: #333; }
.table td { font-size: 12px; }
.name { font-weight: 700; }
.num { text-align: right; width: 70px; }
.money { text-align: right; width: 120px; }

.footer { margin-top: 14px; }

@media print {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
`;

    const body = buildProfitReportHtml({
      language,
      profitPeriod,
      profitDate,
      profitRange,
      profitStats,
      taxCollectedStats,
    });

    const title = `${t.profitTitle} — ${profitDate || ""}`.trim();

    openPrintWindow({
      title,
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.profitTitle} subtitle={t.profitSubtitle} />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={printProfitReportPdf}>
              {t.profitReportPdfButton}
            </Button>
            <Button
              variant="secondary"
              onClick={() => (typeof onBack === "function" ? onBack() : null)}
            >
              {t.back}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.profitPeriodLabel}</label>
                  <select
                    value={profitPeriod}
                    onChange={(e) => setProfitPeriod(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  >
                    <option value="day">{t.profitDay}</option>
                    <option value="week">{t.profitWeek}</option>
                    <option value="month">{t.profitMonth}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.profitDateLabel}</label>
                  <input
                    type="date"
                    value={profitDate}
                    onChange={(e) => setProfitDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Stat label={t.profitRevenue} value={money(profitStats.revenue, language)} />
                <Stat label={t.profitCogs} value={money(profitStats.cogs, language)} />
                <Stat label={t.profitGrossProfit} value={money(profitStats.grossProfit, language)} />
                <Stat label={t.profitMargin} value={`${(profitStats.margin * 100).toFixed(1)}%`} />
                <Stat label={t.profitUnits} value={String(profitStats.units)} />
                <Stat label={t.profitTaxCollected} value={money(taxCollectedStats.inRange, language)} />
                <Stat label={t.profitTaxCollectedAllTime} value={money(taxCollectedStats.allTime, language)} />
              </div>

              {profitStats.inRange.length === 0 ? (
                <div className="text-sm text-zinc-600">{t.profitNoSales}</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.profitTopProducts}</div>
            <div className="mt-3 grid gap-2">
              {profitStats.topProducts.length === 0 ? (
                <div className="text-sm text-zinc-600">{t.profitNoSales}</div>
              ) : (
                profitStats.topProducts.map((x) => (
                  <div
                    key={x.productId}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{x.name}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {t.profitUnits}: {x.units}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900">{money(x.profit, language)}</div>
                      <div className="mt-1 text-xs text-zinc-600">{money(x.revenue, language)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminOrders
function AdminOrders({ orders, setOrders, t, language, onBack }) {
  const ordersList = Array.isArray(orders) ? orders : [];
  const openOrders = ordersList.filter((o) =>
    isOpenOrderStatus(normalizeOrderStatus(o?.status))
  );

  const [expandedOrders, setExpandedOrders] = useState({});

  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [orderStatusErrors, setOrderStatusErrors] = useState({});

  // toggleOrderDetails
  function toggleOrderDetails(orderId) {
    setExpandedOrders((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [orderId]: !prev?.[orderId],
    }));
  }

  // Draft setter: setOrderStatusDraft
  function setOrderStatusDraft(orderId, patch) {
    setOrderStatusErrors((prev) => ({ ...(prev || {}), [orderId]: "" }));
    setOrderStatusDrafts((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [orderId]: {
        ...(prev?.[orderId] || {}),
        ...(patch && typeof patch === "object" ? patch : {}),
      },
    }));
  }

  // Action: applyOrderStatusUpdate
  function applyOrderStatusUpdate(order) {
    if (!order?.id || typeof setOrders !== "function") return;

    const draft = orderStatusDrafts?.[order.id] || {};
    const nextStatus = normalizeOrderStatus(draft.nextStatus || order.status);

    const trackingNumber = String(order?.trackingNumber || "").trim();

    const cancelReason = String(
      (draft.cancelReason || "").trim() ||
        (order?.cancelReason || "").trim() ||
        (order?.customerCancelRequestReason || "").trim()
    ).trim();

    if (nextStatus === "cancelled" && !cancelReason) {
      setOrderStatusErrors((prev) => ({
        ...(prev || {}),
        [order.id]: t.ordersStatusCancelReasonRequired,
      }));
      return;
    }

    if ((nextStatus === "shipped" || nextStatus === "delivered") && !trackingNumber) {
      setOrderStatusErrors((prev) => ({
        ...(prev || {}),
        [order.id]: t.ordersStatusTrackingRequired,
      }));
      return;
    }

    const now = Date.now();

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.map((o) => {
        if (o?.id !== order.id) return o;

        const next = {
          ...o,
          status: nextStatus,
          statusUpdatedAt: now,
          updatedAt: now,
          shippedAt:
            nextStatus === "shipped" || nextStatus === "delivered"
              ? typeof o?.shippedAt === "number"
                ? o.shippedAt
                : now
              : null,
          deliveredAt:
            nextStatus === "delivered"
              ? typeof o?.deliveredAt === "number"
                ? o.deliveredAt
                : now
              : null,
          cancelledAt: nextStatus === "cancelled" ? now : null,
          cancelReason: nextStatus === "cancelled" ? cancelReason : "",
        };

        return next;
      });
    });
  }

  // printShippingLabel
  function printShippingLabel(order) {
    const css = `
@page { size: 4in 6in; margin: 0; }
html, body { width: 4in; height: 6in; margin: 0; padding: 0; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.page { box-sizing: border-box; width: 100%; height: 100%; padding: 0.25in; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.brand { font-size: 18px; font-weight: 800; }
.muted { color: #555; font-size: 12px; }
.orderNo { font-size: 16px; font-weight: 800; }
.box { margin-top: 16px; border: 2px solid #000; border-radius: 10px; padding: 14px; }
.name { margin-top: 6px; font-size: 22px; font-weight: 800; }
.address { margin-top: 10px; font-size: 18px; line-height: 1.2; font-weight: 700; }
.phone { margin-top: 10px; font-size: 16px; font-weight: 700; }

.barcodeBlock { margin-top: 14px; padding-top: 10px; border-top: 1px solid #000; }
.barcodeLabel { font-size: 12px; font-weight: 800; letter-spacing: 0.04em; }
.barcodeImg { margin-top: 6px; }
.barcodeSvg { display: block; width: 100%; height: auto; }
.barcodeText { margin-top: 6px; text-align: center; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; }

.footer { position: absolute; left: 0.25in; right: 0.25in; bottom: 0.25in; }
.small { font-size: 11px; }
`;

    const body = buildShippingLabelHtml({ order, language });
    openPrintWindow({
      title: `${t.ordersPrintLabel} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  // printReceiptPdf
  function printReceiptPdf(order) {
    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.6in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }
.muted { color: #555; font-size: 12px; }

.receipt { max-width: 760px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.right { text-align: right; }
.orderNo { font-size: 16px; font-weight: 800; }

.brandRow { display: flex; align-items: center; gap: 10px; }
.brandLogo { width: 42px; height: 42px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.card { border: 1px solid #ddd; border-radius: 12px; padding: 12px; }
.cardTitle { font-size: 12px; font-weight: 800; color: #111; margin-bottom: 6px; }
.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
.items th, .items td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.items th { text-align: left; font-size: 12px; color: #333; }
.qty { width: 60px; text-align: right; }
.money { width: 110px; text-align: right; }
.itemName { font-weight: 800; }
.itemMeta { margin-top: 4px; font-size: 12px; color: #555; }
.totalRow { display: flex; justify-content: space-between; margin-top: 14px; font-weight: 900; }
.total { font-size: 18px; }
.footer { margin-top: 16px; }
`;

    const body = buildReceiptHtml({ order, language });
    openPrintWindow({
      title: `${t.ordersPrintReceipt} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.ordersTitle} subtitle={t.ordersSubtitle} />
          <Button
            variant="secondary"
            onClick={() => (typeof onBack === "function" ? onBack() : null)}
          >
            {t.back}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Stat label={t.ordersStatusPending} value={String(openOrders.length)} />
          <Stat label={t.ordersTotal} value={String(ordersList.length)} />
        </div>

        <div className="mt-3 text-xs text-zinc-500">{t.ordersReceiptHint}</div>

        {ordersList.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.ordersEmpty}
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {ordersList
              .slice()
              .sort((a, b) => {
                const aStatus = normalizeOrderStatus(a?.status);
                const bStatus = normalizeOrderStatus(b?.status);

                const rank = (s) => (s === "cancelled" ? 2 : s === "shipped" ? 1 : 0);

                const aRank = rank(aStatus);
                const bRank = rank(bStatus);
                if (aRank !== bRank) return aRank - bRank;

                const aTime = typeof a?.createdAt === "number" ? a.createdAt : 0;
                const bTime = typeof b?.createdAt === "number" ? b.createdAt : 0;
                return bTime - aTime;
              })
              .slice(0, 200)
              .map((o) => {
                const status = normalizeOrderStatus(o?.status);
                const statusText = orderStatusLabel(status, t);
                const statusClass = orderStatusBadgeClass(status);

                const createdLabel =
                  typeof o?.createdAt === "number"
                    ? new Date(o.createdAt).toLocaleString(
                        language === "es" ? "es-US" : "en-US"
                      )
                    : "";

                const paymentText =
                  o?.paymentMethod === "paypal" || o?.paymentMethod === "whatsapp"
                    ? t.ordersPaymentPayPal
                    : t.ordersPaymentCard;

                const ship = o?.shipping || {};
                const shipLines = [
                  ship.addressLine1,
                  ship.addressLine2,
                  [ship.city, ship.stateRegion].filter(Boolean).join(", "),
                  ship.postalCode,
                  ship.country,
                ]
                  .map((x) => String(x || "").trim())
                  .filter(Boolean)
                  .join("\n");

                const itemsCount = Array.isArray(o?.items)
                  ? o.items.reduce((acc, it) => acc + (Number(it?.qty) || 0), 0)
                  : 0;

                const isExpanded = Boolean(expandedOrders?.[o.id]);

                const draft = orderStatusDrafts?.[o.id] || {};
                const nextStatusDraft = normalizeOrderStatus(draft.nextStatus || status);
                const showCancelReason = nextStatusDraft === "cancelled";
                const statusError = String(orderStatusErrors?.[o.id] || "").trim();

                const hasCustomerCancelRequest =
                  Boolean(o?.customerCancelRequestedAt) && Boolean(o?.customerCancelRequestReason);

                const customerCancelRequestedAtLabel =
                  typeof o?.customerCancelRequestedAt === "number"
                    ? new Date(o.customerCancelRequestedAt).toLocaleString(
                        language === "es" ? "es-US" : "en-US"
                      )
                    : "";

                return (
                  <div
                    key={o.id}
                    className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-extrabold text-zinc-900">
                            {t.ordersOrder} {o.orderNumber || o.id}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {(o?.customer?.name || "—")}
                          {createdLabel ? ` · ${t.ordersPlacedAt}: ${createdLabel}` : ""}
                          {` · ${t.ordersItems}: ${itemsCount}`}
                          {` · ${t.ordersTotal}: ${money(Number(o?.total) || 0, language)}`}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Button variant="secondary" onClick={() => toggleOrderDetails(o.id)}>
                          {isExpanded ? t.ordersHideDetails : t.ordersViewDetails}
                        </Button>
                        <Button variant="secondary" onClick={() => printShippingLabel(o)}>
                          {t.ordersPrintLabel}
                        </Button>
                        <Button variant="secondary" onClick={() => printReceiptPdf(o)}>
                          {t.ordersPrintReceipt}
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                              <div className="text-sm font-bold text-zinc-900">{t.ordersUpdateStatusLabel}</div>
                              {statusError ? (
                                <div className="mt-2 text-xs font-semibold text-rose-700">{statusError}</div>
                              ) : null}
                            </div>

                            <div className="grid gap-3 md:grid-cols-3 md:items-end">
                              <div>
                                <label className="text-[11px] font-semibold text-zinc-600">
                                  {t.orderStatusCurrentStatus}
                                </label>
                                <select
                                  value={nextStatusDraft}
                                  onChange={(e) =>
                                    setOrderStatusDraft(o.id, { nextStatus: e.target.value })
                                  }
                                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                                >
                                  <option value="pending">{orderStatusLabel("pending", t)}</option>
                                  <option value="preparing">{orderStatusLabel("preparing", t)}</option>
                                  <option value="paused">{orderStatusLabel("paused", t)}</option>
                                  <option value="shipped">{orderStatusLabel("shipped", t)}</option>
                                  <option value="delivered">{orderStatusLabel("delivered", t)}</option>
                                  <option value="cancelled">{orderStatusLabel("cancelled", t)}</option>
                                </select>
                              </div>

                              {showCancelReason ? (
                                <div>
                                  <label className="text-[11px] font-semibold text-zinc-600">
                                    {t.ordersCancelReasonLabel}
                                  </label>
                                  <input
                                    value={String(draft.cancelReason ?? o?.cancelReason ?? "")}
                                    onChange={(e) =>
                                      setOrderStatusDraft(o.id, { cancelReason: e.target.value })
                                    }
                                    placeholder={t.ordersCancelReasonPlaceholder}
                                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                                  />
                                </div>
                              ) : (
                                <div />
                              )}

                              <div>
                                <Button
                                  variant="primary"
                                  className="w-full"
                                  onClick={() => applyOrderStatusUpdate(o)}
                                >
                                  {t.ordersApplyStatus}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {(nextStatusDraft === "shipped" || nextStatusDraft === "delivered") && !statusError ? (
                            <div className="mt-2 text-xs text-zinc-600">
                              {t.ordersStatusTrackingRequired}
                            </div>
                          ) : null}

                          {hasCustomerCancelRequest ? (
                            <div className="mt-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                              <div className="text-xs font-semibold text-zinc-500">
                                {t.orderStatusCancelRequestTitle}
                              </div>
                              {customerCancelRequestedAtLabel ? (
                                <div className="mt-1 text-[11px] text-zinc-600">
                                  {customerCancelRequestedAtLabel}
                                </div>
                              ) : null}
                              <div className="mt-2 text-sm text-zinc-800">
                                {o?.customerCancelRequestReason}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersCustomer}</div>
                          <div className="mt-1 text-sm font-bold text-zinc-900">
                            {o?.customer?.name || "—"}
                          </div>
                          {o?.customer?.phone ? (
                            <div className="mt-1 text-xs text-zinc-600">{o.customer.phone}</div>
                          ) : null}
                          {o?.customer?.email ? (
                            <div className="mt-1 text-xs text-zinc-600">{o.customer.email}</div>
                          ) : null}
                          {o?.customer?.notes ? (
                            <div className="mt-2 text-xs text-zinc-600">{o.customer.notes}</div>
                          ) : null}

                          <div className="mt-3 text-xs text-zinc-600">
                            {t.ordersPaymentMethod}: {paymentText}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersShipping}</div>
                          <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                            {shipLines || "—"}
                          </pre>

                          <div className="mt-3 grid gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-zinc-600">
                                {t.ordersTrackingNumberLabel}
                              </label>
                              <input
                                value={o?.trackingNumber || ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setOrders((prev) => {
                                    const base = Array.isArray(prev) ? prev : [];
                                    return base.map((x) =>
                                      x?.id === o.id
                                        ? { ...x, trackingNumber: v, updatedAt: Date.now() }
                                        : x
                                    );
                                  });
                                }}
                                placeholder={t.ordersTrackingNumberPlaceholder}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-zinc-600">
                                {t.ordersEtaLabel}
                              </label>
                              <input
                                value={o?.etaText || ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setOrders((prev) => {
                                    const base = Array.isArray(prev) ? prev : [];
                                    return base.map((x) =>
                                      x?.id === o.id
                                        ? { ...x, etaText: v, updatedAt: Date.now() }
                                        : x
                                    );
                                  });
                                }}
                                placeholder={t.ordersEtaPlaceholder}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersItems}</div>
                          <div className="mt-1 text-sm font-bold text-zinc-900">{itemsCount}</div>
                          <div className="mt-1 text-xs text-zinc-600">
                            {t.ordersTotal}: {money(Number(o?.total) || 0, language)}
                          </div>
                        </div>

                        <div className="md:col-span-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersItems}</div>
                          <div className="mt-3 grid gap-2">
                            {(Array.isArray(o?.items) ? o.items : []).map((it) => {
                              const p = it?.personalization || {};
                              const fontLabel =
                                l10n(FONTS.find((f) => f.id === p.font)?.label, language) ||
                                String(p.font || "").trim() ||
                                "—";
                              const colorLabel =
                                l10n(COLORS.find((c) => c.id === p.color)?.label, language) ||
                                String(p.color || "").trim() ||
                                "—";

                              return (
                                <div
                                  key={it.id}
                                  className="rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-sm font-bold text-zinc-900">
                                        {l10n(it?.name, language)}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryText} {p.text ? p.text : "—"}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryVerse} {p.verse ? p.verse : "—"}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryFont} {fontLabel}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryColor} {colorLabel}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-sm font-bold text-zinc-900">×{Number(it?.qty) || 0}</div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {money(Number(it?.unitPrice) || 0, language)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// Root: App
// (localStorage persistence + simple client-side routing)
export default function App() {
  const [route, setRoute] = useState("home");
  const [lastOrderId, setLastOrderId] = useState(null);

  const [language, setLanguage] = useState("es");

  const t = translations[language];

  const API_BASE_URL = useMemo(() => {
    if (typeof window === "undefined") return "";

    const envUrl = String(import.meta?.env?.VITE_API_URL || "").trim();
    if (envUrl) return envUrl.replace(/\/+$/, "");

    // Dev default: assume backend is running on the same host at :8000
    const proto = window.location.protocol || "http:";
    const host = window.location.hostname;
    return `${proto}//${host}:8000`;
  }, []);

  const ADMIN_TOKEN_STORAGE_KEY = "gbf.adminToken.v1";

  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return String(window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
    } catch {
      return "";
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!adminToken) {
        window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, adminToken);
    } catch {
      // ignore
    }
  }, [adminToken]);

  const [currentAdminUser, setCurrentAdminUser] = useState(null);
  const [hasAdmins, setHasAdmins] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  const apiJson = useCallback(
    async (path, { method = "GET", body, token } = {}) => {
      const base = String(API_BASE_URL || "").replace(/\/+$/, "");
      if (!base) throw new Error("missing_api_base_url");

      const url = `${base}${String(path || "").startsWith("/") ? "" : "/"}${String(path || "")}`;

      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (body !== undefined) headers["Content-Type"] = "application/json";

      const res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "detail" in data ? String(data.detail) : `http_${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      return data;
    },
    [API_BASE_URL]
  );

  // ---- Backend state sync (cross-device) ----
  const [serverRevision, setServerRevision] = useState(0);
  const serverRevisionRef = useRef(0);
  useEffect(() => {
    serverRevisionRef.current = Number(serverRevision) || 0;
  }, [serverRevision]);

  const [serverPublicOk, setServerPublicOk] = useState(false);
  const [serverAdminOk, setServerAdminOk] = useState(false);

  // When true, we're applying server state into React state; don't push patches back.
  const serverHydratingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiJson("/auth/has-admins");
        if (cancelled) return;
        setHasAdmins(Boolean(data?.hasAdmins));
      } catch {
        if (cancelled) return;
        setHasAdmins(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiJson]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!adminToken) {
        setCurrentAdminUser(null);
        return;
      }

      try {
        const me = await apiJson("/auth/me", { token: adminToken });
        if (cancelled) return;
        setCurrentAdminUser(me && typeof me === "object" ? me : null);
      } catch (err) {
        if (cancelled) return;

        // Only clear the saved token when the server explicitly rejects it.
        // For transient network/server errors, keep the current in-memory auth state
        // to avoid bouncing back to the login screen right after a successful login.
        if (err && typeof err === "object" && err.status === 401) {
          setAdminToken("");
          setCurrentAdminUser(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminToken, apiJson]);

  const [afterLoginRoute, setAfterLoginRoute] = useState("admin");

  // Admin auth gate: require login to access admin-only pages.
  const ADMIN_AUTH_ENABLED = true;

  const isAdminAuthed = Boolean(adminToken && currentAdminUser);

  const prefersReducedMotion = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const canViewTransition =
    typeof document !== "undefined" && typeof document.startViewTransition === "function";

  useEffect(() => {
    if (!canViewTransition || typeof document === "undefined") return;
    document.documentElement.dataset.gbfVt = "1";
  }, [canViewTransition]);

  const runViewTransition = (fn) => {
    if (typeof fn !== "function") return;

    if (
      !canViewTransition ||
      prefersReducedMotion() ||
      (typeof document !== "undefined" && document.documentElement.dataset.gbfVtRunning === "1")
    ) {
      fn();
      return;
    }

    try {
      const vt = document.startViewTransition(() => {
        // View Transitions expects DOM updates to happen during this callback.
        flushSync(() => {
          fn();
        });
      });

      if (vt && typeof vt.finished?.then === "function") {
        document.documentElement.dataset.gbfVtRunning = "1";
        vt.finished.then(
          () => {
            delete document.documentElement.dataset.gbfVtRunning;
          },
          () => {
            delete document.documentElement.dataset.gbfVtRunning;
          }
        );
      }
    } catch {
      fn();
    }
  };

  const ADMIN_PROTECTED_ROUTES = new Set([
    "admin",
    "admin_orders",
    "admin_profit",
    "admin_homepage",
    "admin_inventory",
    "admin_checkout",
    "admin_products",
    "admin_product_preview",
    "admin_policies",
    "admin_users",
  ]);

  const navigate = (nextRoute) => {
    const next = String(nextRoute || "").trim();
    if (!next || next === route) return;

    const wantsProtected = ADMIN_AUTH_ENABLED && ADMIN_PROTECTED_ROUTES.has(next);
    const needsLogin = wantsProtected && !isAdminAuthed;
    const finalRoute = needsLogin ? "admin_login" : next;

    runViewTransition(() => {
      if (needsLogin) setAfterLoginRoute(next);
      setRoute(finalRoute);
    });
  };

  async function refreshAdminUsers() {
    if (!adminToken) {
      setAdminUsers([]);
      return;
    }

    try {
      const rows = await apiJson("/admin-users", { token: adminToken });
      setAdminUsers(Array.isArray(rows) ? rows : []);
    } catch {
      setAdminUsers([]);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!adminToken) {
        if (cancelled) return;
        setAdminUsers([]);
        return;
      }

      try {
        const rows = await apiJson("/admin-users", { token: adminToken });
        if (cancelled) return;
        setAdminUsers(Array.isArray(rows) ? rows : []);
      } catch {
        if (cancelled) return;
        setAdminUsers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminToken, apiJson]);

  async function createAdminUser({ name, username, password }) {
    const n = String(name || "").trim();
    const u = String(username || "").trim();
    const p = String(password || "");
    if (!n || !u || !p.trim()) return false;
    if (!adminToken) return false;

    try {
      await apiJson("/admin-users", {
        method: "POST",
        token: adminToken,
        body: { name: n, username: u, password: p },
      });
      await refreshAdminUsers();
      return true;
    } catch {
      return false;
    }
  }

  async function updateAdminUser({ userId, name }) {
    const id = String(userId || "").trim();
    const n = String(name || "").trim();
    if (!id || !n) return false;
    if (!adminToken) return false;

    try {
      await apiJson(`/admin-users/${id}`, {
        method: "PATCH",
        token: adminToken,
        body: { name: n },
      });
      await refreshAdminUsers();
      return true;
    } catch {
      return false;
    }
  }

  async function deleteAdminUser({ userId }) {
    const id = String(userId || "").trim();
    if (!id) return false;
    if (!adminToken) return false;

    try {
      await apiJson(`/admin-users/${id}`, { method: "DELETE", token: adminToken });
      await refreshAdminUsers();

      // If the current user was deleted, force logout.
      if (String(currentAdminUser?.id || "") === id) {
        setAdminToken("");
        setCurrentAdminUser(null);
        setRoute("home");
      }

      return true;
    } catch {
      return false;
    }
  }

  async function loginAdmin({ username, password }) {
    const u = String(username || "").trim();
    const p = String(password || "");
    if (!u || !p.trim()) return false;

    try {
      const data = await apiJson("/auth/login", {
        method: "POST",
        body: { username: u, password: p },
      });

      const token = String(data?.token || "").trim();
      const user = data?.user && typeof data.user === "object" ? data.user : null;
      if (!token || !user) return false;

      const nextRoute =
        typeof afterLoginRoute === "string" &&
        afterLoginRoute &&
        ADMIN_PROTECTED_ROUTES.has(afterLoginRoute)
          ? afterLoginRoute
          : "admin";

      runViewTransition(() => {
        setAdminToken(token);
        setCurrentAdminUser(user);
        setRoute(nextRoute);
      });

      await refreshAdminUsers();

      // Load full admin state (and auto-migrate this device's current local data if the server is empty).
      try {
        const adminState = await apiJson("/state/admin", { token });
        setServerAdminOk(true);
        setServerRevision(Number(adminState?.revision) || 0);

        const serverEmpty = Boolean(adminState?.empty);

        const localHasData =
          (Array.isArray(products) && products.length > 0) ||
          (Array.isArray(categories) && categories.length > 0) ||
          (orders && Array.isArray(orders) && orders.length > 0);

        if (serverEmpty && localHasData) {
          // Carry over the order counter so backend order numbers continue from the current series.
          let orderCounter = 0;
          try {
            const raw = window.localStorage.getItem(ORDER_COUNTER_STORAGE_KEY);
            const n = Number(raw);
            orderCounter = Number.isFinite(n) && n > 0 ? n : 0;
          } catch {
            orderCounter = 0;
          }

          const patch = {
            orderCounter,
            heroConfig,
            categories,
            products,
            inventory,
            productCosts,
            orders,
            sales,
            checkoutConfig,
            policiesConfig,
            newsletterEmails,
            reviewsByProduct,
            activityLog,
          };

          await apiJson("/state/admin", {
            method: "PUT",
            token,
            body: { replace: true, patch },
          });

          const hydrated = await apiJson("/state/admin", { token });
          setServerRevision(Number(hydrated?.revision) || 0);
          if (hydrated && typeof hydrated === "object" && hydrated.state && typeof hydrated.state === "object") {
            applyServerStateSafely(hydrated.state);
          }
        } else {
          if (adminState && typeof adminState === "object" && adminState.state && typeof adminState.state === "object") {
            applyServerStateSafely(adminState.state);
          }
        }
      } catch {
        setServerAdminOk(false);
      }

      return true;
    } catch {
      return false;
    }
  }


  async function logoutAdmin() {
    const token = String(adminToken || "").trim();

    runViewTransition(() => {
      setAdminToken("");
      setCurrentAdminUser(null);
      setAdminUsers([]);
      setServerAdminOk(false);
      setRoute("home");
    });

    try {
      pendingAdminPatchRef.current = {};
      if (pendingAdminPatchTimerRef.current) {
        window.clearTimeout(pendingAdminPatchTimerRef.current);
        pendingAdminPatchTimerRef.current = null;
      }
    } catch {
      // ignore
    }

    if (!token) return;

    try {
      await apiJson("/auth/logout", { method: "POST", token });
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [route]);

  const [toasts, setToasts] = useState([]);

  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch {
      // ignore
    }
  }, [recentlyViewed]);

  const [reviewsByProduct, setReviewsByProduct] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsByProduct));
    } catch {
      // ignore
    }
  }, [reviewsByProduct]);

  const ratingSummaryByProductId = useMemo(() => {
    const out = {};
    const entries = reviewsByProduct && typeof reviewsByProduct === "object" ? reviewsByProduct : {};

    for (const [productId, list] of Object.entries(entries)) {
      const rows = Array.isArray(list) ? list : [];
      let total = 0;
      let count = 0;

      for (const r of rows) {
        const v = Number(r?.rating);
        if (!Number.isFinite(v)) continue;
        const clamped = Math.max(1, Math.min(5, v));
        total += clamped;
        count += 1;
      }

      if (count > 0) {
        out[String(productId)] = { avg: total / count, count };
      }
    }

    return out;
  }, [reviewsByProduct]);

  function addProductReview({ productId, rating, name, text }) {
    const id = String(productId || "").trim();
    if (!id) return;

    const r = Math.round(Number(rating));
    const safeRating = Number.isFinite(r) ? Math.max(1, Math.min(5, r)) : 0;
    const safeName = String(name || "").trim();
    const safeText = String(text || "").trim();

    if (!safeRating || safeText.length < 3) return;

    setReviewsByProduct((prev) => {
      const base = prev && typeof prev === "object" ? prev : {};
      const current = Array.isArray(base[id]) ? base[id] : [];

      const reviewId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `review-${id}-${current.length + 1}`;

      const row = {
        id: reviewId,
        ts: Date.now(),
        rating: safeRating,
        name: safeName,
        text: safeText,
      };

      return {
        ...base,
        [id]: [row, ...current].slice(0, 200),
      };
    });

    pushToast(t.toastReviewAdded, "success");
    logActivity({
      kind: "review",
      messageEs: `Reseña añadida (${safeRating}/5): ${id}`,
      messageEn: `Review added (${safeRating}/5): ${id}`,
    });

    // Persist to backend for cross-device sync.
    if (serverPublicOk) {
      apiJson("/public/reviews", {
        method: "POST",
        body: { productId: id, rating: safeRating, name: safeName, text: safeText },
      })
        .then((res) => {
          if (res && typeof res === "object") {
            const nextRev = Number(res?.revision);
            if (Number.isFinite(nextRev)) setServerRevision(nextRev);
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }

  const [newsletterEmails, setNewsletterEmails] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(NEWSLETTER_EMAILS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(NEWSLETTER_EMAILS_STORAGE_KEY, JSON.stringify(newsletterEmails));
    } catch {
      // ignore
    }
  }, [newsletterEmails]);

  const [activityLog, setActivityLog] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(activityLog));
    } catch {
      // ignore
    }
  }, [activityLog]);

  function dismissToast(id) {
    setToasts((prev) => (Array.isArray(prev) ? prev.filter((x) => x?.id !== id) : []));
  }

  function pushToast(message, tone = "success", durationMs = 2600) {
    const text = String(message || "").trim();
    if (!text) return;

    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    setToasts((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [...base, { id, message: text, tone }];
      return next.slice(-3);
    });

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setToasts((prev) => (Array.isArray(prev) ? prev.filter((x) => x?.id !== id) : []));
      }, Math.max(800, Number(durationMs) || 2600));
    }
  }

  function logActivity({ kind = "info", messageEs = "", messageEn = "" }) {
    const es = String(messageEs || "").trim();
    const en = String(messageEn || "").trim();
    if (!es && !en) return;

    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    setActivityLog((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [{ id, ts: Date.now(), kind, message: { es, en } }, ...base];
      return next.slice(0, 200);
    });
  }

  function clearActivityLog() {
    setActivityLog([]);
    pushToast(language === "es" ? "Log limpiado" : "Log cleared", "info");
  }

  function toggleFavorite(productId) {
    const id = String(productId || "").trim();
    if (!id) return;

    const base = Array.isArray(favorites) ? favorites.map((x) => String(x)) : [];
    const has = base.includes(id);
    const next = has ? base.filter((x) => x !== id) : [...base, id];

    setFavorites(next);

    const product = products.find((p) => String(p?.id ?? "") === id);
    const displayName = product ? l10n(product.name, language) : id;

    pushToast(has ? t.toastFavoriteRemoved : t.toastFavoriteAdded, "success");
    logActivity({
      kind: "favorite",
      messageEs: has
        ? `Favorito removido: ${displayName}`
        : `Favorito añadido: ${displayName}`,
      messageEn: has
        ? `Favorite removed: ${displayName}`
        : `Favorite added: ${displayName}`,
    });
  }

  function submitNewsletterEmail(email) {
    const value = String(email || "").trim().toLowerCase();
    if (!value) return;

    setNewsletterEmails((prev) => {
      const base = Array.isArray(prev) ? prev.map((x) => String(x).trim().toLowerCase()) : [];
      const next = base.includes(value) ? base : [value, ...base];
      return next.slice(0, 2000);
    });

    pushToast(t.toastSubscribed, "success");
    logActivity({
      kind: "newsletter",
      messageEs: `Newsletter signup: ${value}`,
      messageEn: `Newsletter signup: ${value}`,
    });

    // Persist to backend for cross-device sync.
    if (serverPublicOk) {
      apiJson("/public/newsletter", { method: "POST", body: { email: value } })
        .then((res) => {
          if (res && typeof res === "object") {
            const nextRev = Number(res?.revision);
            if (Number.isFinite(nextRev)) setServerRevision(nextRev);
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }

  const [heroConfig, setHeroConfig] = useState(() => {
    if (typeof window === "undefined") return buildDefaultHeroConfig();
    try {
      const raw = window.localStorage.getItem(HERO_STORAGE_KEY);
      if (!raw) return buildDefaultHeroConfig();
      return normalizeHeroConfig(JSON.parse(raw));
    } catch {
      return buildDefaultHeroConfig();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroConfig));
    } catch {
      // ignore storage errors
    }
  }, [heroConfig]);

  const [checkoutConfig, setCheckoutConfig] = useState(() => {
    if (typeof window === "undefined") return buildDefaultCheckoutConfig();
    try {
      const raw = window.localStorage.getItem(CHECKOUT_CONFIG_STORAGE_KEY);
      if (!raw) return buildDefaultCheckoutConfig();
      return normalizeCheckoutConfig(JSON.parse(raw));
    } catch {
      return buildDefaultCheckoutConfig();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        CHECKOUT_CONFIG_STORAGE_KEY,
        JSON.stringify(normalizeCheckoutConfig(checkoutConfig))
      );
    } catch {
      // ignore storage errors
    }
  }, [checkoutConfig]);

  const [policiesConfig, setPoliciesConfig] = useState(() => {
    if (typeof window === "undefined") return buildDefaultPoliciesConfig();
    try {
      const raw = window.localStorage.getItem(POLICIES_STORAGE_KEY);
      if (!raw) return buildDefaultPoliciesConfig();
      return normalizePoliciesConfig(JSON.parse(raw));
    } catch {
      return buildDefaultPoliciesConfig();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        POLICIES_STORAGE_KEY,
        JSON.stringify(normalizePoliciesConfig(policiesConfig))
      );
    } catch {
      // ignore
    }
  }, [policiesConfig]);

  const [checkoutDraft, setCheckoutDraft] = useState(() => buildDefaultCheckoutDraft());

  const [inventory, setInventory] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      // ignore storage errors
    }
  }, [inventory]);

  const [productCosts, setProductCosts] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(PRODUCT_COSTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        PRODUCT_COSTS_STORAGE_KEY,
        JSON.stringify(productCosts)
      );
    } catch {
      // ignore storage errors
    }
  }, [productCosts]);

  const [sales, setSales] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(SALES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch {
      // ignore storage errors
    }
  }, [sales]);

  const [orders, setOrders] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handler: onStorage (sync orders between tabs)
    function onStorage(e) {
      if (!e) return;
      if (e.key !== ORDERS_STORAGE_KEY) return;

      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (!Array.isArray(parsed)) return;
        setOrders(parsed);
      } catch {
        // ignore
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [categories, setCategories] = useState(() => {
    if (typeof window === "undefined") return buildDefaultCategories();
    try {
      const raw = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!raw) return buildDefaultCategories();
      return normalizeCategories(JSON.parse(raw));
    } catch {
      return buildDefaultCategories();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(normalizeCategories(categories))
      );
    } catch {
      // ignore storage errors
    }
  }, [categories]);

  const [products, setProducts] = useState(() => {
    if (typeof window === "undefined") return buildDefaultProducts();

    try {
      const rawCats = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const cats = rawCats ? normalizeCategories(JSON.parse(rawCats)) : buildDefaultCategories();
      const fallback = cats[0] || buildDefaultCategories()[0];

      const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const list = raw ? normalizeProducts(JSON.parse(raw)) : buildDefaultProducts();

      return Array.isArray(list)
        ? list.map((p) => {
            const current = String(p?.category ?? "").trim();
            if (current && cats.includes(current)) return p;
            return { ...p, category: fallback };
          })
        : buildDefaultProducts();
    } catch {
      return buildDefaultProducts();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(normalizeProducts(products)));
    } catch {
      // ignore storage errors
    }
  }, [products]);

  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);

  const isAdminRoute = ADMIN_PROTECTED_ROUTES.has(route);

  const applyServerStateObject = useCallback((st) => {
    if (!st || typeof st !== "object") return;

    if ("heroConfig" in st && st.heroConfig && typeof st.heroConfig === "object") {
      setHeroConfig(normalizeHeroConfig(st.heroConfig));
    }
    if ("categories" in st && Array.isArray(st.categories)) {
      setCategories(normalizeCategories(st.categories));
    }
    if ("products" in st && Array.isArray(st.products)) {
      setProducts(normalizeProducts(st.products));
    }
    if ("inventory" in st && st.inventory && typeof st.inventory === "object") {
      setInventory(st.inventory);
    }
    if ("checkoutConfig" in st && st.checkoutConfig && typeof st.checkoutConfig === "object") {
      setCheckoutConfig(normalizeCheckoutConfig(st.checkoutConfig));
    }
    if ("policiesConfig" in st && st.policiesConfig && typeof st.policiesConfig === "object") {
      setPoliciesConfig(normalizePoliciesConfig(st.policiesConfig));
    }
    if ("reviewsByProduct" in st && st.reviewsByProduct && typeof st.reviewsByProduct === "object") {
      setReviewsByProduct(st.reviewsByProduct);
    }

    // Admin-only blocks
    if ("productCosts" in st && st.productCosts && typeof st.productCosts === "object") {
      setProductCosts(st.productCosts);
    }
    if ("orders" in st && Array.isArray(st.orders)) {
      setOrders(st.orders);
    }
    if ("sales" in st && Array.isArray(st.sales)) {
      setSales(st.sales);
    }
    if ("newsletterEmails" in st && Array.isArray(st.newsletterEmails)) {
      setNewsletterEmails(st.newsletterEmails.map((x) => String(x)));
    }
    if ("activityLog" in st && Array.isArray(st.activityLog)) {
      setActivityLog(st.activityLog);
    }
  }, []);

  const applyServerStateSafely = useCallback(
    (st) => {
      serverHydratingRef.current = true;
      try {
        applyServerStateObject(st);
      } finally {
        serverHydratingRef.current = false;
      }
    },
    [applyServerStateObject]
  );

  // Initial public state load (catalog/configs/hero/inventory) from backend
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiJson("/state/public");
        if (cancelled) return;

        setServerPublicOk(true);
        setServerRevision(Number(data?.revision) || 0);

        if (!data || typeof data !== "object" || data.unchanged) return;
        applyServerStateSafely(data);
      } catch {
        if (cancelled) return;
        setServerPublicOk(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiJson, applyServerStateSafely]);

  // Poll public state for cross-device updates
  useEffect(() => {
    if (!serverPublicOk) return;

    let stopped = false;
    const id = window.setInterval(() => {
      (async () => {
        try {
          const rev = serverRevisionRef.current;
          const data = await apiJson(`/state/public?ifRevision=${encodeURIComponent(String(rev))}`);
          if (stopped) return;

          setServerPublicOk(true);

          if (!data || typeof data !== "object" || data.unchanged) return;
          setServerRevision(Number(data?.revision) || 0);
          applyServerStateSafely(data);
        } catch {
          if (stopped) return;
          setServerPublicOk(false);
        }
      })();
    }, 4000);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [serverPublicOk, apiJson, applyServerStateSafely]);

  // Poll admin state when logged in and on admin routes (orders/costs/etc.)
  useEffect(() => {
    if (!isAdminAuthed || !isAdminRoute || !adminToken) return;

    let stopped = false;
    const id = window.setInterval(() => {
      (async () => {
        try {
          const rev = serverRevisionRef.current;
          const data = await apiJson(`/state/admin?ifRevision=${encodeURIComponent(String(rev))}`, {
            token: adminToken,
          });
          if (stopped) return;

          setServerAdminOk(true);

          if (!data || typeof data !== "object" || data.unchanged) return;

          const nextRev = Number(data?.revision) || 0;
          setServerRevision(nextRev);

          const st = data?.state;
          if (st && typeof st === "object") {
            applyServerStateSafely(st);
          }
        } catch {
          if (stopped) return;
          setServerAdminOk(false);
        }
      })();
    }, 3500);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [isAdminAuthed, isAdminRoute, adminToken, apiJson, applyServerStateSafely]);

  // Debounced admin patch save (only for admin UI changes)
  const pendingAdminPatchRef = useRef({});
  const pendingAdminPatchTimerRef = useRef(null);

  const scheduleAdminPatch = useCallback(
    (patch) => {
      if (!isAdminAuthed || !adminToken) return;
      if (!serverAdminOk) return;
      if (!patch || typeof patch !== "object") return;

      // Merge into a single pending patch
      pendingAdminPatchRef.current = { ...pendingAdminPatchRef.current, ...patch };

      if (pendingAdminPatchTimerRef.current) {
        window.clearTimeout(pendingAdminPatchTimerRef.current);
      }

      pendingAdminPatchTimerRef.current = window.setTimeout(async () => {
        const toSend = pendingAdminPatchRef.current;
        pendingAdminPatchRef.current = {};

        if (!toSend || typeof toSend !== "object" || Object.keys(toSend).length === 0) return;
        if (serverHydratingRef.current) return;

        try {
          const res = await apiJson("/state/admin", {
            method: "PUT",
            token: adminToken,
            body: {
              replace: false,
              expectedRevision: serverRevisionRef.current,
              patch: toSend,
            },
          });

          setServerAdminOk(true);
          if (res && typeof res === "object") {
            const nextRev = Number(res?.revision);
            if (Number.isFinite(nextRev)) setServerRevision(nextRev);
          }
        } catch (err) {
          // Conflict or offline; polling will reconcile.
          if (err && typeof err === "object" && err.status === 409) {
            setServerAdminOk(true);
          }
        }
      }, 700);
    },
    [isAdminAuthed, adminToken, serverAdminOk, apiJson]
  );

  // Admin-side saves (route-scoped to avoid overwriting unrelated sections)
  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_homepage" && route !== "admin") return;
    scheduleAdminPatch({ heroConfig });
  }, [heroConfig, isAdminAuthed, route, scheduleAdminPatch]);

  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_products" && route !== "admin") return;
    scheduleAdminPatch({ categories, products });
  }, [categories, products, isAdminAuthed, route, scheduleAdminPatch]);

  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_inventory") return;
    scheduleAdminPatch({ inventory, productCosts });
  }, [inventory, productCosts, isAdminAuthed, route, scheduleAdminPatch]);

  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_checkout") return;
    scheduleAdminPatch({ checkoutConfig });
  }, [checkoutConfig, isAdminAuthed, route, scheduleAdminPatch]);

  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_policies") return;
    scheduleAdminPatch({ policiesConfig });
  }, [policiesConfig, isAdminAuthed, route, scheduleAdminPatch]);

  useEffect(() => {
    if (!isAdminAuthed) return;
    if (route !== "admin_orders") return;
    scheduleAdminPatch({ orders });
  }, [orders, isAdminAuthed, route, scheduleAdminPatch]);

  const cartCount = cart.reduce((acc, it) => acc + it.qty, 0);

  const confirmationOrder = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (lastOrderId) {
      return list.find((o) => o?.id === lastOrderId) || null;
    }
    return list[0] || null;
  }, [orders, lastOrderId]);

  // openProduct
  function openProduct(p) {
    const id = String(p?.id ?? "").trim();
    const resolved = id ? products.find((x) => String(x?.id ?? "") === id) || p : p;

    runViewTransition(() => {
      setSelected(resolved);
      setRoute("product");

      if (!id) return;
      setRecentlyViewed((prev) => {
        const base = Array.isArray(prev) ? prev.map((x) => String(x)) : [];
        const next = [id, ...base.filter((x) => x !== id)];
        return next.slice(0, 12);
      });
    });
  }


  // addToCart
  function addToCart(product, personalization) {
    const key = `${product.id}-${personalization.text}-${personalization.verse}-${personalization.font}-${personalization.color}`;

    const name = l10n(product?.name, language) || "";
    if (typeof t.toastProductAdded === "function") {
      pushToast(t.toastProductAdded(name || "Producto"));
    } else {
      pushToast(language === "es" ? "Producto añadido" : "Added to cart");
    }

    runViewTransition(() => {
      setCart((prev) => {
        const found = prev.find((x) => x.key === key);
        if (found) {
          return prev.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
        }
        return [
          ...prev,
          {
            key,
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            qty: 1,
            personalization,
          },
        ];
      });

      setRoute("cart");
    });
  }


  // removeFromCart
  function removeFromCart(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }
  // placeOrder
  async function placeOrder({
    customer,
    shipping,
    paymentMethod,
    taxRatePct,
    taxStateRatePct,
    taxMunicipalRatePct,
    shippingFee,
  }) {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    // PayPal is handled via /paypal/* (create + capture) so we never create unpaid PayPal orders.
    if (String(paymentMethod || "").toLowerCase() === "paypal") {
      return null;
    }

    // Prefer backend as source of truth for cross-device sync.
    if (serverPublicOk) {
      try {
        const items = cart
          .map((it) => ({
            productId: String(it?.id ?? "").trim(),
            qty: Number(it?.qty) || 0,
            unitPrice: Number(it?.price) || 0,
            name: it?.name,
            category: it?.category,
            personalization: it?.personalization,
          }))
          .filter((it) => it.productId && it.qty > 0);

        if (items.length) {
          const res = await apiJson("/checkout/place-order", {
            method: "POST",
            body: {
              items,
              customer,
              shipping,
              paymentMethod,
              taxRatePct,
              taxStateRatePct,
              taxMunicipalRatePct,
              shippingFee,
            },
          });

          const order = res && typeof res === "object" ? res.order : null;

          if (order && typeof order === "object") {
            // Apply updated server state subsets
            if (Array.isArray(res?.orders)) setOrders(res.orders);
            if (res?.inventory && typeof res.inventory === "object") setInventory(res.inventory);
            if (Array.isArray(res?.sales)) setSales(res.sales);
            if (Array.isArray(res?.newsletterEmails)) setNewsletterEmails(res.newsletterEmails);

            const nextRev = Number(res?.revision);
            if (Number.isFinite(nextRev)) setServerRevision(nextRev);

            setCart([]);
            setCheckoutDraft(buildDefaultCheckoutDraft());

            runViewTransition(() => {
              setLastOrderId(order.id);
              setRoute("order_confirmation");
            });

            pushToast(t.orderConfirmationToastOrderSent, "success");

            return { orderId: order.id, orderNumber: order.orderNumber || order.id };
          }
        }
      } catch {
        // Fall back to local-only behavior.
      }
    }

    const createdAt = Date.now();
    const orderId = safeUUID("order");
    const orderNumber = getNextOrderNumber();

    const nextPaymentMethod =
      paymentMethod === "paypal" || paymentMethod === "whatsapp" ? "paypal" : "card";

    const orderItems = cart.map((it) => ({
      id: safeUUID("order_item"),
      productId: String(it.id),
      qty: Number(it.qty) || 0,
      unitPrice: Number(it.price) || 0,
      name: it.name,
      category: it.category,
      personalization: it.personalization,
    }));

    const subtotal = roundMoney(
      orderItems.reduce(
        (acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
        0
      )
    );

    const nextTotalTaxRate = parseNumberOr(taxRatePct, Number.NaN);

    const nextStateRateFallback = Number.isFinite(nextTotalTaxRate)
      ? (nextTotalTaxRate * PR_TAX_STATE_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_STATE_RATE_PCT;

    const nextMunicipalRateFallback = Number.isFinite(nextTotalTaxRate)
      ? (nextTotalTaxRate * PR_TAX_MUNICIPAL_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_MUNICIPAL_RATE_PCT;

    const nextStateRate = Math.max(0, parseNumberOr(taxStateRatePct, nextStateRateFallback));
    const nextMunicipalRate = Math.max(
      0,
      parseNumberOr(taxMunicipalRatePct, nextMunicipalRateFallback)
    );

    const nextTaxRate = roundMoney(nextStateRate + nextMunicipalRate);

    const nextShipping = Math.max(0, parseNumberOr(shippingFee, 0));

    const taxStateAmount = roundMoney(subtotal * (nextStateRate / 100));
    const taxMunicipalAmount = roundMoney(subtotal * (nextMunicipalRate / 100));
    const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);

    const total = roundMoney(subtotal + taxAmount + nextShipping);

    const order = {
      id: orderId,
      orderNumber,
      createdAt,
      updatedAt: createdAt,
      statusUpdatedAt: createdAt,
      status: "pending", // pending | preparing | paused | shipped | cancelled
      customer,
      shipping,
      paymentMethod: nextPaymentMethod, // card | paypal
      trackingNumber: "",
      shippedAt: null,
      etaText: "",
      cancelReason: "",
      cancelledAt: null,
      customerCancelRequestReason: "",
      customerCancelRequestedAt: null,
      subtotal,
      taxRatePct: nextTaxRate,
      taxStateRatePct: nextStateRate,
      taxMunicipalRatePct: nextMunicipalRate,
      taxStateAmount,
      taxMunicipalAmount,
      taxAmount,
      shippingFee: nextShipping,
      items: orderItems,
      total,
      currency: "USD",
    };

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [order, ...base];
      return next.slice(0, 2000);
    });

    const saleItems = orderItems.map((it) => {
      const unitCost = Number(productCosts?.[it.productId] ?? 0) || 0;

      return {
        id: safeUUID("sale_item"),
        createdAt,
        orderId,
        orderNumber,
        productId: it.productId,
        qty: it.qty,
        unitPrice: it.unitPrice,
        unitCost,
        name: it.name,
        category: it.category,
        personalization: it.personalization,
        customer,
        shipping,
      };
    });

    // Capture email for order updates + promotions (saved locally)
    {
      const email = String(customer?.email || "")
        .trim()
        .toLowerCase();

      const looksLikeEmail = (value) => {
        const s = String(value || "").trim();
        if (!s) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
      };

      if (looksLikeEmail(email)) {
        setNewsletterEmails((prev) => {
          const base = Array.isArray(prev)
            ? prev.map((x) => String(x).trim().toLowerCase())
            : [];

          const next = base.includes(email) ? base : [email, ...base];
          return next.slice(0, 2000);
        });

        logActivity({
          kind: "newsletter",
          messageEs: `Email guardado desde checkout: ${email}`,
          messageEn: `Email saved from checkout: ${email}`,
        });
      }
    }

    setSales((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [...saleItems, ...base];
      return next.slice(0, 5000);
    });

    setInventory((prev) => {
      const next = { ...(prev && typeof prev === "object" ? prev : {}) };
      for (const it of cart) {
        const productId = String(it.id);
        const current = Number(next[productId] ?? 0) || 0;
        next[productId] = current - (Number(it.qty) || 0);
      }
      return next;
    });

    setCart([]);
    setCheckoutDraft(buildDefaultCheckoutDraft());

    runViewTransition(() => {
      setLastOrderId(orderId);
      setRoute("order_confirmation");
    });

    pushToast(t.orderConfirmationToastOrderSent, "success");

    return { orderId, orderNumber };
  }

  const runViewTransitionRef = useRef(runViewTransition);
  runViewTransitionRef.current = runViewTransition;

  const pushToastRef = useRef(pushToast);
  pushToastRef.current = pushToast;

  const getPayPalConfig = useCallback(async () => {
    return apiJson("/paypal/config");
  }, [apiJson]);

  const createPayPalOrder = useCallback(
    async ({ items, customer, shipping }) => {
      if (!serverPublicOk) throw new Error("server_offline");

      return apiJson("/paypal/create-order", {
        method: "POST",
        body: {
          items,
          customer,
          shipping,
        },
      });
    },
    [apiJson, serverPublicOk]
  );

  const capturePayPalOrderAndFinalize = useCallback(
    async ({ paypalOrderId, items, customer, shipping }) => {
      if (!serverPublicOk) throw new Error("server_offline");

      const res = await apiJson("/paypal/capture-order", {
        method: "POST",
        body: {
          paypalOrderId,
          items,
          customer,
          shipping,
        },
      });

      const order = res && typeof res === "object" ? res.order : null;

      if (order && typeof order === "object") {
        if (Array.isArray(res?.orders)) setOrders(res.orders);
        if (res?.inventory && typeof res.inventory === "object") setInventory(res.inventory);
        if (Array.isArray(res?.sales)) setSales(res.sales);
        if (Array.isArray(res?.newsletterEmails)) setNewsletterEmails(res.newsletterEmails);

        const nextRev = Number(res?.revision);
        if (Number.isFinite(nextRev)) setServerRevision(nextRev);

        setCart([]);
        setCheckoutDraft(buildDefaultCheckoutDraft());

        const vt = runViewTransitionRef.current;
        if (typeof vt === "function") {
          vt(() => {
            setLastOrderId(order.id);
            setRoute("order_confirmation");
          });
        } else {
          setLastOrderId(order.id);
          setRoute("order_confirmation");
        }

        const toast = pushToastRef.current;
        if (typeof toast === "function") {
          toast(t.orderConfirmationToastOrderSent, "success");
        }

        return { orderId: order.id, orderNumber: order.orderNumber || order.id };
      }

      return null;
    },
    [
      apiJson,
      serverPublicOk,
      t.orderConfirmationToastOrderSent,
      setOrders,
      setInventory,
      setSales,
      setNewsletterEmails,
      setServerRevision,
      setCart,
      setCheckoutDraft,
      setLastOrderId,
      setRoute,
    ]
  );

  async function lookupOrderStatusByNumber(orderNumber) {
    const q = String(orderNumber || "").trim();
    if (!q) return null;

    try {
      const data = await apiJson(`/public/order-status?orderNumber=${encodeURIComponent(q)}`);
      if (data && typeof data === "object" && data.found && data.order && typeof data.order === "object") {
        return data.order;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function sendOrderCancelRequest({ orderNumber, reason }) {
    const on = String(orderNumber || "").trim();
    const rsn = String(reason || "").trim();
    if (!on || !rsn) return false;

    try {
      const res = await apiJson("/public/order-cancel-request", {
        method: "POST",
        body: { orderNumber: on, reason: rsn },
      });

      if (res && typeof res === "object") {
        const nextRev = Number(res?.revision);
        if (Number.isFinite(nextRev)) setServerRevision(nextRev);
      }

      return true;
    } catch {
      return false;
    }
  }

  const renderRoutedContent = (r) => {
    const orderFlowStep =
      r === "cart" ? 1 : r === "checkout" ? 2 : r === "checkout_review" ? 3 : 0;

    return (
      <>
        {/* Order flow progress (Cart → Checkout → Review) */}
        {orderFlowStep ? <OrderFlowStepper currentStep={orderFlowStep} t={t} /> : null}

        {/* Route: home */}
        {r === "home" ? (
          <Home
            products={products}
            favorites={favorites}
            recentlyViewedProducts={recentlyViewed
              .map((id) => products.find((p) => String(p?.id ?? "") === String(id)))
              .filter(Boolean)}
            stockById={inventory}
            ratingSummaryById={ratingSummaryByProductId}
            onToggleFavorite={toggleFavorite}
            notify={pushToast}
            onSubmitNewsletterEmail={submitNewsletterEmail}
            t={t}
            language={language}
            heroConfig={heroConfig}
            onGoCatalog={() => navigate("catalog")}
            onOpenProduct={openProduct}
          />
        ) : null}

        {/* Route: catalog */}
        {r === "catalog" ? (
          <Catalog
            products={products}
            categories={categories}
            favorites={favorites}
            stockById={inventory}
            ratingSummaryById={ratingSummaryByProductId}
            onToggleFavorite={toggleFavorite}
            onOpenProduct={openProduct}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: product */}
        {(r === "product" || r === "admin_product_preview") && selected ? (
          <ProductDetail
            key={String(selected?.id ?? "product")}
            product={selected}
            products={products}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onOpenProduct={openProduct}
            stockById={inventory}
            ratingSummaryById={ratingSummaryByProductId}
            reviews={reviewsByProduct?.[String(selected.id)]}
            onAddReview={addProductReview}
            notify={pushToast}
            onBack={() => navigate(r === "admin_product_preview" ? "admin" : "catalog")}
            onAddToCart={addToCart}
            onGoCheckout={r === "admin_product_preview" ? undefined : () => navigate("checkout")}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: cart */}
        {r === "cart" ? (
          <Cart
            cart={cart}
            checkoutConfig={checkoutConfig}
            onRemove={removeFromCart}
            onCheckout={() => navigate("checkout")}
            onBack={() => navigate("catalog")}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: wishlist */}
        {r === "wishlist" ? (
          <Wishlist
            favorites={favorites}
            products={products}
            stockById={inventory}
            ratingSummaryById={ratingSummaryByProductId}
            onOpenProduct={openProduct}
            onToggleFavorite={toggleFavorite}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: checkout */}
        {r === "checkout" ? (
          <Checkout
            cart={cart}
            checkoutConfig={checkoutConfig}
            checkoutDraft={checkoutDraft}
            setCheckoutDraft={setCheckoutDraft}
            onBack={() => navigate("cart")}
            onGoReview={() => navigate("checkout_review")}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: checkout review */}
        {r === "checkout_review" ? (
          <CheckoutReview
            cart={cart}
            checkoutConfig={checkoutConfig}
            checkoutDraft={checkoutDraft}
            setCheckoutDraft={setCheckoutDraft}
            policiesConfig={policiesConfig}
            onGoPolicies={() => navigate("policies")}
            onBack={() => navigate("checkout")}
            onRemove={removeFromCart}
            onPlaceOrder={placeOrder}
            serverPublicOk={serverPublicOk}
            onGetPayPalConfig={getPayPalConfig}
            onPayPalCreateOrder={createPayPalOrder}
            onPayPalCaptureOrder={capturePayPalOrderAndFinalize}
            notify={pushToast}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: order confirmation */}
        {r === "order_confirmation" ? (
          <OrderConfirmation
            order={confirmationOrder}
            onGoHome={() => navigate("home")}
            t={t}
            language={language}
          />
        ) : null}

        {/* Route: order status */}
        {r === "order_status" ? (
          <OrderStatus
            orders={orders}
            setOrders={setOrders}
            notify={pushToast}
            t={t}
            language={language}
            serverPublicOk={serverPublicOk}
            onLookupOrderStatus={lookupOrderStatusByNumber}
            onSendCancelRequest={sendOrderCancelRequest}
          />
        ) : null}

        {/* Route: blog */}
        {r === "blog" ? <Blog t={t} language={language} /> : null}

        {/* Route: about */}
        {r === "about" ? <About t={t} language={language} /> : null}

        {/* Route: faq */}
        {r === "faq" ? <Faq t={t} language={language} /> : null}

        {/* Route: policies */}
        {r === "policies" ? (
          <Policies policiesConfig={policiesConfig} t={t} language={language} />
        ) : null}

        {/* Route: admin login */}
        {r === "admin_login" ? (
          <AdminLogin
            t={t}
            language={language}
            hasAdmins={hasAdmins}
            onLogin={loginAdmin}
            onGoHome={() => navigate("home")}
          />
        ) : null}

        {/* Route: admin users */}
        {r === "admin_users" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminUsers
              t={t}
              language={language}
              adminUsers={adminUsers}
              onCreateUser={createAdminUser}
              onUpdateUser={updateAdminUser}
              onDeleteUser={deleteAdminUser}
              onBack={() => navigate("admin")}
              onLogout={logoutAdmin}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin */}
        {r === "admin" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminPanel
              page="dashboard"
              products={products}
              setProducts={setProducts}
              categories={categories}
              setCategories={setCategories}
              heroConfig={heroConfig}
              inventory={inventory}
              setInventory={setInventory}
              productCosts={productCosts}
              setProductCosts={setProductCosts}
              orders={orders}
              checkoutConfig={checkoutConfig}
              setCheckoutConfig={setCheckoutConfig}
              notify={pushToast}
              onPreviewProduct={(p) => {
                runViewTransition(() => {
                  setSelected(p);
                  setRoute("admin_product_preview");
                });
              }}
              activityLog={activityLog}
              onClearActivityLog={clearActivityLog}
              logActivity={logActivity}
              onGoOrders={() => navigate("admin_orders")}
              onGoInventory={() => navigate("admin_inventory")}
              onGoCheckout={() => navigate("admin_checkout")}
              onGoPolicies={() => navigate("admin_policies")}
              onGoProducts={() => navigate("admin_products")}
              onGoProfit={() => navigate("admin_profit")}
              onGoAdminUsers={() => navigate("admin_users")}
              onLogoutAdmin={logoutAdmin}
              onGoHomepage={() => navigate("admin_homepage")}
              currentAdminUser={currentAdminUser}
              t={t}
              language={language}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin products */}
        {r === "admin_products" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminPanel
              page="products"
              products={products}
              setProducts={setProducts}
              categories={categories}
              setCategories={setCategories}
              heroConfig={heroConfig}
              inventory={inventory}
              setInventory={setInventory}
              productCosts={productCosts}
              setProductCosts={setProductCosts}
              orders={orders}
              checkoutConfig={checkoutConfig}
              setCheckoutConfig={setCheckoutConfig}
              notify={pushToast}
              onPreviewProduct={(p) => {
                runViewTransition(() => {
                  setSelected(p);
                  setRoute("admin_product_preview");
                });
              }}
              activityLog={activityLog}
              onClearActivityLog={clearActivityLog}
              logActivity={logActivity}
              onGoOrders={() => navigate("admin_orders")}
              onGoInventory={() => navigate("admin_inventory")}
              onGoCheckout={() => navigate("admin_checkout")}
              onGoPolicies={() => navigate("admin_policies")}
              onGoProducts={() => navigate("admin")}
              onGoProfit={() => navigate("admin_profit")}
              onGoAdminUsers={() => navigate("admin_users")}
              onLogoutAdmin={logoutAdmin}
              onGoHomepage={() => navigate("admin_homepage")}
              currentAdminUser={currentAdminUser}
              t={t}
              language={language}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin inventory */}
        {r === "admin_inventory" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminInventory
              products={products}
              inventory={inventory}
              setInventory={setInventory}
              productCosts={productCosts}
              setProductCosts={setProductCosts}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin checkout settings */}
        {r === "admin_checkout" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminCheckoutSettings
              checkoutConfig={checkoutConfig}
              setCheckoutConfig={setCheckoutConfig}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin policies */}
        {r === "admin_policies" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminPolicies
              policiesConfig={policiesConfig}
              setPoliciesConfig={setPoliciesConfig}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin homepage */}
        {r === "admin_homepage" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminHomepage
              heroConfig={heroConfig}
              setHeroConfig={setHeroConfig}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin orders */}
        {r === "admin_orders" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminOrders
              orders={orders}
              setOrders={setOrders}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}

        {/* Route: admin profit/loss */}
        {r === "admin_profit" ? (
          !ADMIN_AUTH_ENABLED || isAdminAuthed ? (
            <AdminProfit
              products={products}
              sales={sales}
              orders={orders}
              t={t}
              language={language}
              onBack={() => navigate("admin")}
            />
          ) : (
            <AdminLogin
              t={t}
              language={language}
              hasAdmins={hasAdmins}
              onLogin={loginAdmin}
              onGoHome={() => navigate("home")}
            />
          )
        ) : null}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <TopBar
        route={route}
        setRoute={navigate}
        cartCount={cartCount}
        t={t}
        language={language}
        setLanguage={setLanguage}
      />

      <div className="text-[#2B2B2B]">
        <PageTransition key="gbf-route" routeKey={route} render={renderRoutedContent} />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
        <div className="pb-10" />
      </div>
    </div>
  );
}
