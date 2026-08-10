from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.app_state import AppState
from app.schemas.checkout import PlaceOrderRequest, PlaceOrderResponse
from app.services.ops_events import append_activity_log, log_event

router = APIRouter(prefix="/checkout", tags=["checkout"])


def _iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    try:
        return dt.isoformat()
    except Exception:
        return None


def _safe_uuid(prefix: str) -> str:
    # Not cryptographic; sufficient for local app IDs.
    import secrets

    return f"{prefix}-{int(datetime.utcnow().timestamp() * 1000)}-{secrets.token_hex(6)}"


def _looks_like_email(value: str) -> bool:
    s = str(value or "").strip()
    if not s:
        return False
    return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", s) is not None


def _parse_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return float(default)


def _inventory_int(inventory: dict[str, Any], product_id: str) -> int | None:
    """Return current stock as int when inventory explicitly manages this product.

    If the product key is missing or not an int-ish value, return None (meaning: not managed).
    """

    if product_id not in inventory:
        return None

    try:
        return int(inventory.get(product_id))
    except Exception:
        return None


def _compute_totals_from_state(*, state: dict[str, Any], items: list[dict[str, Any]]) -> dict[str, float]:
    products = state.get("products")
    products = products if isinstance(products, list) else []

    checkout_cfg = state.get("checkoutConfig")
    checkout_cfg = checkout_cfg if isinstance(checkout_cfg, dict) else {}

    tax_state_rate = max(0.0, _parse_float(checkout_cfg.get("prTaxStateRatePct"), 0.0))
    tax_municipal_rate = max(0.0, _parse_float(checkout_cfg.get("prTaxMunicipalRatePct"), 0.0))
    shipping_fee = max(0.0, _parse_float(checkout_cfg.get("defaultShippingFee"), 0.0))

    # Prices come from server state products to avoid client tampering.
    subtotal = 0.0
    for it in items:
        pid = str(it.get("productId") or "").strip()
        qty = int(it.get("qty") or 0)
        if not pid or qty <= 0:
            continue

        p = next((x for x in products if str(x.get("id") or "") == pid), None)
        if not p:
            raise HTTPException(status_code=400, detail=f"unknown_product:{pid}")

        unit_price = _parse_float(p.get("price"), 0.0)
        if unit_price < 0:
            raise HTTPException(status_code=400, detail="invalid_price")

        subtotal += qty * unit_price

    subtotal = round(subtotal, 2)

    tax_state_amount = round(subtotal * (tax_state_rate / 100.0), 2)
    tax_municipal_amount = round(subtotal * (tax_municipal_rate / 100.0), 2)
    tax_amount = round(tax_state_amount + tax_municipal_amount, 2)
    total = round(subtotal + tax_amount + shipping_fee, 2)

    return {
        "subtotal": subtotal,
        "taxStateRatePct": tax_state_rate,
        "taxMunicipalRatePct": tax_municipal_rate,
        "taxAmount": tax_amount,
        "shippingFee": shipping_fee,
        "total": total,
    }


def _get_row(db: Session) -> AppState:
    row = db.get(AppState, 1)
    if row:
        return row

    row = AppState(id=1, revision=0, updated_at=datetime.utcnow(), state={})
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/place-order", response_model=PlaceOrderResponse)
def place_order(req: PlaceOrderRequest, db: Session = Depends(get_db)):
    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})

    # --- Load current state blocks ---
    inventory = state.get("inventory")
    inventory = inventory if isinstance(inventory, dict) else {}

    product_costs = state.get("productCosts")
    product_costs = product_costs if isinstance(product_costs, dict) else {}

    orders = state.get("orders")
    orders = orders if isinstance(orders, list) else []

    sales = state.get("sales")
    sales = sales if isinstance(sales, list) else []

    newsletter_emails = state.get("newsletterEmails")
    newsletter_emails = newsletter_emails if isinstance(newsletter_emails, list) else []

    products = state.get("products")
    products = products if isinstance(products, list) else []

    # --- Create order ---
    created_at = int(datetime.utcnow().timestamp() * 1000)
    order_id = _safe_uuid("order")

    order_counter = int(state.get("orderCounter") or 0)
    order_counter += 1
    state["orderCounter"] = order_counter
    order_number = f"GBF-{str(order_counter).zfill(6)}"

    payment_method = "paypal" if str(req.paymentMethod or "").lower() in ("paypal", "whatsapp") else "card"

    # PayPal orders must be created after a successful capture.
    if payment_method == "paypal":
        raise HTTPException(status_code=400, detail="paypal_requires_capture")

    # Normalize request items
    req_items: list[dict[str, Any]] = []
    for it in req.items:
        pid = str(it.productId or "").strip()
        qty = int(it.qty)
        if not pid or qty <= 0:
            continue
        req_items.append({"productId": pid, "qty": qty, "personalization": it.personalization})

    if not req_items:
        raise HTTPException(status_code=400, detail="empty_items")

    # Strict stock check (only for products with an explicit numeric inventory entry).
    for it in req_items:
        pid = str(it.get("productId") or "")
        qty = int(it.get("qty") or 0)
        if not pid or qty <= 0:
            continue

        stock_int = _inventory_int(inventory, pid)
        if stock_int is None:
            continue
        if stock_int < qty:
            raise HTTPException(status_code=409, detail=f"out_of_stock:{pid}")

    totals = _compute_totals_from_state(state=state, items=req_items)

    # Order items use server prices + names.
    items = []
    subtotal = 0.0

    for it in req_items:
        pid = str(it.get("productId") or "")
        qty = int(it.get("qty") or 0)
        if not pid or qty <= 0:
            continue

        p = next((x for x in products if str(x.get("id") or "") == pid), None)
        if not p:
            raise HTTPException(status_code=400, detail=f"unknown_product:{pid}")

        unit_price = round(_parse_float(p.get("price"), 0.0), 2)
        if unit_price < 0:
            raise HTTPException(status_code=400, detail="invalid_price")

        line_total = qty * unit_price
        subtotal += line_total

        items.append(
            {
                "id": _safe_uuid("order_item"),
                "productId": pid,
                "qty": qty,
                "unitPrice": unit_price,
                "name": p.get("name"),
                "category": p.get("category"),
                "personalization": it.get("personalization"),
            }
        )

    subtotal = round(subtotal, 2)

    tax_state_rate = float(totals["taxStateRatePct"])
    tax_municipal_rate = float(totals["taxMunicipalRatePct"])
    tax_rate_pct = round(tax_state_rate + tax_municipal_rate, 2)

    tax_state_amount = round(subtotal * (tax_state_rate / 100.0), 2)
    tax_municipal_amount = round(subtotal * (tax_municipal_rate / 100.0), 2)
    tax_amount = round(tax_state_amount + tax_municipal_amount, 2)

    shipping_fee = float(totals["shippingFee"])
    total = round(float(totals["total"]), 2)

    order = {
        "id": order_id,
        "orderNumber": order_number,
        "createdAt": created_at,
        "updatedAt": created_at,
        "statusUpdatedAt": created_at,
        "status": "pending",
        "customer": req.customer,
        "shipping": req.shipping,
        "paymentMethod": payment_method,
        "trackingNumber": "",
        "shippedAt": None,
        "etaText": "",
        "cancelReason": "",
        "cancelledAt": None,
        "customerCancelRequestReason": "",
        "customerCancelRequestedAt": None,
        "subtotal": round(subtotal, 2),
        "taxRatePct": tax_rate_pct,
        "taxStateRatePct": tax_state_rate,
        "taxMunicipalRatePct": tax_municipal_rate,
        "taxStateAmount": tax_state_amount,
        "taxMunicipalAmount": tax_municipal_amount,
        "taxAmount": tax_amount,
        "shippingFee": shipping_fee,
        "items": items,
        "total": total,
        "currency": "USD",
    }

    orders = [order, *orders]
    orders = orders[:2000]

    # --- Inventory + sales updates ---
    for it in items:
        pid = str(it.get("productId") or "")
        qty = int(it.get("qty") or 0)
        if not pid or qty <= 0:
            continue

        stock_int = _inventory_int(inventory, pid)
        if stock_int is not None:
            inventory[pid] = stock_int - qty

        unit_cost = 0.0
        try:
            unit_cost = float(product_costs.get(pid) or 0)
        except Exception:
            unit_cost = 0.0

        sales.insert(
            0,
            {
                "id": _safe_uuid("sale_item"),
                "createdAt": created_at,
                "orderId": order_id,
                "orderNumber": order_number,
                "productId": pid,
                "qty": qty,
                "unitPrice": float(it.get("unitPrice") or 0),
                "unitCost": unit_cost,
                "name": it.get("name"),
                "category": it.get("category"),
                "personalization": it.get("personalization"),
                "customer": req.customer,
                "shipping": req.shipping,
            },
        )

    sales = sales[:5000]

    # --- Newsletter capture ---
    email = str((req.customer or {}).get("email") or "").strip().lower()
    if _looks_like_email(email) and isinstance(newsletter_emails, list):
        if email not in newsletter_emails:
            newsletter_emails = [email, *newsletter_emails]
            newsletter_emails = newsletter_emails[:2000]

    # --- Operational notifications (log-only + activity log) ---
    contact = email or str((req.customer or {}).get("phone") or "").strip() or None
    log_event(
        "order_placed",
        orderNumber=order_number,
        paymentMethod=payment_method,
        total=total,
        currency="USD",
        contact=contact,
    )

    state = append_activity_log(
        state,
        kind="order",
        message_es=f"Nueva orden: {order_number} — Total ${total:.2f} ({payment_method}).",
        message_en=f"New order: {order_number} — Total ${total:.2f} ({payment_method}).",
        ts_ms=created_at,
    )

    # --- Save back to state ---
    state["inventory"] = inventory
    state["orders"] = orders
    state["sales"] = sales
    state["newsletterEmails"] = newsletter_emails

    row.state = state
    row.revision = int(row.revision or 0) + 1
    row.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(row)
    except Exception:
        db.rollback()
        raise

    return {
        "ok": True,
        "revision": int(row.revision or 0),
        "updatedAt": _iso(row.updated_at),
        "order": order,
        "inventory": inventory,
        "orders": orders,
        "sales": sales,
        "newsletterEmails": newsletter_emails,
    }
