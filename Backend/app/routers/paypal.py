from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.app_state import AppState
from app.schemas.paypal import (
    PayPalCaptureOrderRequest,
    PayPalCaptureOrderResponse,
    PayPalConfigResponse,
    PayPalCreateOrderRequest,
    PayPalCreateOrderResponse,
)
from app.services.paypal import PayPalServiceError, capture_order, create_order

router = APIRouter(prefix="/paypal", tags=["paypal"])


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


def _display_name(value: Any) -> str:
    if isinstance(value, dict):
        for k in ("es", "en", "name", "title"):
            v = str(value.get(k) or "").strip()
            if v:
                return v
        # fall back to any string-ish value
        for v in value.values():
            s = str(v or "").strip()
            if s:
                return s
        return ""
    return str(value or "").strip()


def _parse_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return float(default)


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


@router.get("/config", response_model=PayPalConfigResponse)
def paypal_config() -> PayPalConfigResponse:
    client_id = str(settings.paypal_client_id or "").strip()
    configured = bool(client_id and str(settings.paypal_client_secret or "").strip())

    return PayPalConfigResponse(
        configured=configured,
        clientId=client_id if configured else None,
        environment=str(settings.paypal_environment or "sandbox").strip().lower(),
        currency=str(settings.paypal_currency or "USD").strip().upper() or "USD",
    )


@router.post("/create-order", response_model=PayPalCreateOrderResponse)
def paypal_create_order(req: PayPalCreateOrderRequest, db: Session = Depends(get_db)):
    client_id = str(settings.paypal_client_id or "").strip()
    client_secret = str(settings.paypal_client_secret or "").strip()
    if not (client_id and client_secret):
        raise HTTPException(status_code=503, detail="paypal_not_configured")

    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})

    # Normalize request items
    items = []
    for it in req.items:
        pid = str(it.productId or "").strip()
        qty = int(it.qty)
        if not pid or qty <= 0:
            continue
        items.append(
            {
                "productId": pid,
                "qty": qty,
                "name": it.name,
                "category": it.category,
                "personalization": it.personalization,
            }
        )

    if not items:
        raise HTTPException(status_code=400, detail="empty_items")

    # Optional stock check (only when inventory has a numeric value for the product).
    inventory = state.get("inventory")
    inventory = inventory if isinstance(inventory, dict) else {}
    for it in items:
        pid = str(it.get("productId") or "")
        try:
            current_stock = inventory.get(pid)
            if current_stock is None:
                continue
            stock_int = int(current_stock)
        except Exception:
            continue
        if stock_int < int(it.get("qty") or 0):
            raise HTTPException(status_code=409, detail=f"out_of_stock:{pid}")

    totals = _compute_totals_from_state(state=state, items=items)

    currency = str(settings.paypal_currency or "USD").strip().upper() or "USD"

    # Build PayPal line items using server prices
    products = state.get("products")
    products = products if isinstance(products, list) else []

    paypal_items: list[dict[str, Any]] = []
    for it in items:
        pid = str(it.get("productId") or "")
        qty = int(it.get("qty") or 0)
        if not pid or qty <= 0:
            continue

        p = next((x for x in products if str(x.get("id") or "") == pid), None)
        if not p:
            raise HTTPException(status_code=400, detail=f"unknown_product:{pid}")

        unit_price = round(_parse_float(p.get("price"), 0.0), 2)
        name = _display_name(it.get("name")) or _display_name(p.get("name")) or pid
        name = name[:127]

        paypal_items.append(
            {
                "name": name,
                "quantity": str(qty),
                "unit_amount": {"currency_code": currency, "value": f"{unit_price:.2f}"},
            }
        )

    breakdown = {
        "item_total": {"currency_code": currency, "value": f"{totals['subtotal']:.2f}"},
        "tax_total": {"currency_code": currency, "value": f"{totals['taxAmount']:.2f}"},
        "shipping": {"currency_code": currency, "value": f"{totals['shippingFee']:.2f}"},
    }

    request_id = f"gbf-create-{_safe_uuid('pp')[:48]}"

    try:
        data = create_order(
            total=totals["total"],
            currency=currency,
            items=paypal_items,
            breakdown=breakdown,
            request_id=request_id,
        )
    except PayPalServiceError as e:
        raise HTTPException(status_code=502, detail={"code": e.code, "detail": e.detail})

    oid = str(data.get("id") or "").strip()
    if not oid:
        raise HTTPException(status_code=502, detail={"code": "paypal_missing_order_id", "detail": data})

    return PayPalCreateOrderResponse(
        ok=True,
        paypalOrderId=oid,
        currency=currency,
        subtotal=float(totals["subtotal"]),
        taxAmount=float(totals["taxAmount"]),
        shippingFee=float(totals["shippingFee"]),
        total=float(totals["total"]),
    )


@router.post("/capture-order", response_model=PayPalCaptureOrderResponse)
def paypal_capture_and_place_order(req: PayPalCaptureOrderRequest, db: Session = Depends(get_db)):
    client_id = str(settings.paypal_client_id or "").strip()
    client_secret = str(settings.paypal_client_secret or "").strip()
    if not (client_id and client_secret):
        raise HTTPException(status_code=503, detail="paypal_not_configured")

    paypal_order_id = str(req.paypalOrderId or "").strip()
    if not paypal_order_id:
        raise HTTPException(status_code=400, detail="missing_paypal_order_id")

    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})

    # If we've already created an order for this PayPal order id, return it (idempotent).
    orders = state.get("orders")
    orders = orders if isinstance(orders, list) else []
    for o in orders:
        if not isinstance(o, dict):
            continue
        pd = o.get("paymentDetails")
        if isinstance(pd, dict) and str(pd.get("paypalOrderId") or "") == paypal_order_id:
            inventory = state.get("inventory")
            inventory = inventory if isinstance(inventory, dict) else {}
            sales = state.get("sales")
            sales = sales if isinstance(sales, list) else []
            newsletter_emails = state.get("newsletterEmails")
            newsletter_emails = newsletter_emails if isinstance(newsletter_emails, list) else []

            return {
                "ok": True,
                "revision": int(row.revision or 0),
                "updatedAt": _iso(row.updated_at),
                "order": o,
                "inventory": inventory,
                "orders": orders,
                "sales": sales,
                "newsletterEmails": newsletter_emails,
            }

    # Capture via PayPal API
    try:
        cap = capture_order(paypal_order_id=paypal_order_id, request_id=f"gbf-capture-{paypal_order_id}")
    except PayPalServiceError as e:
        raise HTTPException(status_code=502, detail={"code": e.code, "detail": e.detail})

    status = str(cap.get("status") or "").strip().upper()
    if status != "COMPLETED":
        raise HTTPException(status_code=400, detail={"code": "paypal_not_completed", "status": status, "raw": cap})

    payer = cap.get("payer") if isinstance(cap.get("payer"), dict) else {}
    payer_email = str(payer.get("email_address") or "").strip()

    paypal_capture_id = ""
    paypal_total = None
    paypal_currency = None

    try:
        pu0 = (cap.get("purchase_units") or [])[0]
        payments = pu0.get("payments") if isinstance(pu0, dict) else {}
        captures = payments.get("captures") if isinstance(payments, dict) else []
        c0 = captures[0] if isinstance(captures, list) and captures else {}
        paypal_capture_id = str(c0.get("id") or "").strip()
        amt = c0.get("amount") if isinstance(c0.get("amount"), dict) else {}
        paypal_currency = str(amt.get("currency_code") or "").strip().upper() or None
        paypal_total = float(amt.get("value")) if amt.get("value") is not None else None
    except Exception:
        paypal_capture_id = paypal_capture_id or ""

    # Normalize request items (snapshot fields preserved)
    req_items = []
    for it in req.items:
        pid = str(it.productId or "").strip()
        qty = int(it.qty)
        if not pid or qty <= 0:
            continue
        req_items.append(
            {
                "productId": pid,
                "qty": qty,
                "name": it.name,
                "category": it.category,
                "personalization": it.personalization,
            }
        )

    if not req_items:
        raise HTTPException(status_code=400, detail="empty_items")

    # --- Load current state blocks ---
    inventory = state.get("inventory")
    inventory = inventory if isinstance(inventory, dict) else {}

    product_costs = state.get("productCosts")
    product_costs = product_costs if isinstance(product_costs, dict) else {}

    sales = state.get("sales")
    sales = sales if isinstance(sales, list) else []

    newsletter_emails = state.get("newsletterEmails")
    newsletter_emails = newsletter_emails if isinstance(newsletter_emails, list) else []

    products = state.get("products")
    products = products if isinstance(products, list) else []

    totals = _compute_totals_from_state(state=state, items=req_items)

    # --- Create order (paid) ---
    created_at = int(datetime.utcnow().timestamp() * 1000)
    order_id = _safe_uuid("order")

    order_counter = int(state.get("orderCounter") or 0)
    order_counter += 1
    state["orderCounter"] = order_counter
    order_number = f"GBF-{str(order_counter).zfill(6)}"

    # Order items use server prices.
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

        unit_price = float(_parse_float(p.get("price"), 0.0))
        line_total = qty * unit_price
        subtotal += line_total

        items.append(
            {
                "id": _safe_uuid("order_item"),
                "productId": pid,
                "qty": qty,
                "unitPrice": round(unit_price, 2),
                "name": it.get("name"),
                "category": it.get("category"),
                "personalization": it.get("personalization"),
            }
        )

    subtotal = round(subtotal, 2)

    payment_details: dict[str, Any] = {
        "provider": "paypal",
        "paypalOrderId": paypal_order_id,
        "paypalCaptureId": paypal_capture_id or None,
        "payerEmail": payer_email or None,
        "status": status,
    }

    # Prefer the PayPal-captured currency/amount if present.
    currency = paypal_currency or str(settings.paypal_currency or "USD").strip().upper() or "USD"

    computed_total = float(totals["total"])
    total = round(computed_total, 2)

    if paypal_total is not None:
        paypal_total = round(float(paypal_total), 2)
        if abs(paypal_total - total) > 0.01:
            payment_details["amountMismatch"] = {"computedTotal": total, "paypalTotal": paypal_total}
            total = paypal_total

    tax_state_rate = float(totals["taxStateRatePct"])
    tax_municipal_rate = float(totals["taxMunicipalRatePct"])
    tax_rate_pct = round(tax_state_rate + tax_municipal_rate, 2)

    tax_state_amount = round(subtotal * (tax_state_rate / 100.0), 2)
    tax_municipal_amount = round(subtotal * (tax_municipal_rate / 100.0), 2)
    tax_amount = round(tax_state_amount + tax_municipal_amount, 2)

    shipping_fee = float(totals["shippingFee"])

    order = {
        "id": order_id,
        "orderNumber": order_number,
        "createdAt": created_at,
        "updatedAt": created_at,
        "statusUpdatedAt": created_at,
        "status": "pending",
        "customer": req.customer,
        "shipping": req.shipping,
        "paymentMethod": "paypal",
        "paymentDetails": payment_details,
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
        "total": round(total, 2),
        "currency": currency,
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
