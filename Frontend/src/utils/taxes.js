import {
  PR_TAX_STATE_RATE_PCT,
  PR_TAX_MUNICIPAL_RATE_PCT,
  PR_TAX_TOTAL_RATE_PCT,
} from "../data/taxes";
import { parseNumberOr, roundMoney } from "./format";

// Helper: getPrTaxBreakdownFromOrder
export function getPrTaxBreakdownFromOrder(order, subtotalFallback = 0) {
  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : Math.max(0, Number(subtotalFallback) || 0);

  const stateRateFromOrder = Number.isFinite(Number(order?.taxStateRatePct))
    ? Number(order.taxStateRatePct)
    : null;
  const municipalRateFromOrder = Number.isFinite(Number(order?.taxMunicipalRatePct))
    ? Number(order.taxMunicipalRatePct)
    : null;

  const totalRateFromOrder = Number.isFinite(Number(order?.taxRatePct)) ? Number(order.taxRatePct) : null;

  const stateRateDefault =
    totalRateFromOrder != null
      ? (totalRateFromOrder * PR_TAX_STATE_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_STATE_RATE_PCT;

  const municipalRateDefault =
    totalRateFromOrder != null
      ? (totalRateFromOrder * PR_TAX_MUNICIPAL_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_MUNICIPAL_RATE_PCT;

  const stateRatePct = Math.max(0, parseNumberOr(stateRateFromOrder, stateRateDefault));
  const municipalRatePct = Math.max(0, parseNumberOr(municipalRateFromOrder, municipalRateDefault));

  const taxTotalAmountFromOrder = Number.isFinite(Number(order?.taxAmount)) ? Number(order.taxAmount) : null;

  let stateAmount = Number.isFinite(Number(order?.taxStateAmount))
    ? Number(order.taxStateAmount)
    : roundMoney(subtotal * (stateRatePct / 100));

  let municipalAmount = Number.isFinite(Number(order?.taxMunicipalAmount))
    ? Number(order.taxMunicipalAmount)
    : roundMoney(subtotal * (municipalRatePct / 100));

  let totalAmount = taxTotalAmountFromOrder;
  if (totalAmount == null) {
    totalAmount = roundMoney(stateAmount + municipalAmount);
  } else {
    totalAmount = roundMoney(totalAmount);
  }

  const diff = roundMoney(totalAmount - (stateAmount + municipalAmount));
  if (diff !== 0) stateAmount = roundMoney(stateAmount + diff);

  const totalRatePct = roundMoney(stateRatePct + municipalRatePct);

  return {
    subtotal,
    stateRatePct,
    municipalRatePct,
    totalRatePct,
    stateAmount,
    municipalAmount,
    totalAmount,
  };
}
