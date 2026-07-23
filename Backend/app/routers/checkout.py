from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.app_state import AppState
from app.schemas.checkout import PlaceOrderRequest, PlaceOrderResponse

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

    items = []
    subtotal = 0.0

    for it in req.items:
        qty = int(it.qty)
        if qty <= 0:
            raise HTTPException(status_code=400, detail="invalid_qty")

        unit_price = float(it.unitPrice)
        if unit_price < 0:
            raise HTTPException(status_code=400, detail="invalid_unit_price")

        line_total = qty * unit_price
        subtotal += line_total

        items.append(
            {
                "id": _safe_uuid("order_item"),
                "productId": str(it.productId),
                "qty": qty,
                "unitPrice": unit_price,
                "name": it.name,
                "category": it.category,
                "personalization": it.personalization,
            }
        )

    tax_state_rate = float(req.taxStateRatePct) if req.taxStateRatePct is not None else None
    tax_municipal_rate = float(req.taxMunicipalRatePct) if req.taxMunicipalRatePct is not None else None

    # If only total tax is provided, just store it (client already computes amounts in UI).
    tax_rate_pct = None
    if req.taxRatePct is not None:
        try:
            tax_rate_pct = float(req.taxRatePct)
        except Exception:
            tax_rate_pct = None

    shipping_fee = 0.0
    if req.shippingFee is not None:
        try:
            shipping_fee = max(0.0, float(req.shippingFee))
        except Exception:
            shipping_fee = 0.0

    # Compute tax amounts if split rates were provided; otherwise leave at 0.
    tax_state_amount = 0.0
    tax_municipal_amount = 0.0
    if tax_state_rate is not None:
        tax_state_amount = round(subtotal * (tax_state_rate / 100.0), 2)
    if tax_municipal_rate is not None:
        tax_municipal_amount = round(subtotal * (tax_municipal_rate / 100.0), 2)

    tax_amount = round(tax_state_amount + tax_municipal_amount, 2)
    total = round(subtotal + tax_amount + shipping_fee, 2)

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

        current_stock = 0
        try:
            current_stock = int(inventory.get(pid) or 0)
        except Exception:
            current_stock = 0

        inventory[pid] = current_stock - qty

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
