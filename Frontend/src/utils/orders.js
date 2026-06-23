// Helper: normalizeOrderStatus
export function normalizeOrderStatus(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "fulfilled") return "shipped";
  if (s === "preparing" || s === "paused" || s === "cancelled" || s === "shipped" || s === "pending") {
    return s;
  }
  return "pending";
}

// Helper: isOpenOrderStatus
export function isOpenOrderStatus(status) {
  const s = normalizeOrderStatus(status);
  return s !== "shipped" && s !== "cancelled";
}

// Helper: orderStatusLabel
export function orderStatusLabel(status, t) {
  const s = normalizeOrderStatus(status);
  if (s === "preparing") return t.ordersStatusPreparing;
  if (s === "paused") return t.ordersStatusPaused;
  if (s === "shipped") return t.ordersStatusShipped;
  if (s === "cancelled") return t.ordersStatusCancelled;
  return t.ordersStatusPending;
}

// Helper: orderStatusBadgeClass
export function orderStatusBadgeClass(status) {
  const s = normalizeOrderStatus(status);
  if (s === "shipped") return "bg-emerald-100 text-emerald-800";
  if (s === "cancelled") return "bg-zinc-200 text-zinc-800";
  if (s === "paused") return "bg-sky-100 text-sky-800";
  if (s === "preparing") return "bg-violet-100 text-violet-800";
  return "bg-amber-100 text-amber-800";
}
