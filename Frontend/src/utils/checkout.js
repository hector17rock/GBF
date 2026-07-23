import { parseNumberOr } from "./format";
import {
  PR_TAX_STATE_RATE_PCT,
  PR_TAX_MUNICIPAL_RATE_PCT,
} from "../data/taxes";

// Helper: buildDefaultCheckoutConfig
export function buildDefaultCheckoutConfig() {
  return {
    prTaxStateRatePct: PR_TAX_STATE_RATE_PCT,
    prTaxMunicipalRatePct: PR_TAX_MUNICIPAL_RATE_PCT,
    defaultShippingFee: 0,
  };
}

// Helper: normalizeCheckoutConfig
export function normalizeCheckoutConfig(cfg) {
  const base = buildDefaultCheckoutConfig();
  if (!cfg || typeof cfg !== "object") return base;

  const prTaxStateRatePct = Math.max(
    0,
    parseNumberOr(cfg.prTaxStateRatePct, base.prTaxStateRatePct)
  );
  const prTaxMunicipalRatePct = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, base.prTaxMunicipalRatePct)
  );
  const defaultShippingFee = Math.max(0, parseNumberOr(cfg.defaultShippingFee, base.defaultShippingFee));

  return { prTaxStateRatePct, prTaxMunicipalRatePct, defaultShippingFee };
}

// Helper: buildDefaultCheckoutDraft
export function buildDefaultCheckoutDraft() {
  return {
    paymentMethod: "card", // card | paypal
    acceptPolicies: false,
    customer: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
    shipping: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateRegion: "",
      postalCode: "",
      country: "",
    },
    card: {
      name: "",
      number: "",
      expiry: "",
      cvc: "",
      zip: "",
    },
  };
}

// Helper: normalizeCheckoutDraft
export function normalizeCheckoutDraft(draft) {
  const base = buildDefaultCheckoutDraft();
  const cfg = draft && typeof draft === "object" ? draft : {};

  const paymentMethod =
    cfg.paymentMethod === "paypal" || cfg.paymentMethod === "whatsapp" ? "paypal" : "card";

  const acceptPolicies = Boolean(cfg.acceptPolicies);

  return {
    ...base,
    ...cfg,
    paymentMethod,
    acceptPolicies,
    customer: { ...base.customer, ...(cfg.customer || {}) },
    shipping: { ...base.shipping, ...(cfg.shipping || {}) },
    card: { ...base.card, ...(cfg.card || {}) },
  };
}
