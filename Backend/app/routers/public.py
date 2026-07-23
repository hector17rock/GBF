from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.app_state import AppState
from app.schemas.public import (
    NewsletterSignupRequest,
    ReviewCreateRequest,
    OrderStatusLookupResponse,
    OrderCancelRequest,
)

router = APIRouter(prefix="/public", tags=["public"])


def _iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    try:
        return dt.isoformat()
    except Exception:
        return None


def _safe_uuid(prefix: str) -> str:
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


@router.post("/newsletter")
def newsletter_signup(req: NewsletterSignupRequest, db: Session = Depends(get_db)):
    email = str(req.email or "").strip().lower()
    if not _looks_like_email(email):
        raise HTTPException(status_code=400, detail="invalid_email")

    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})

    emails = state.get("newsletterEmails")
    emails = emails if isinstance(emails, list) else []

    if email not in emails:
        emails = [email, *emails]
        emails = emails[:2000]

    state["newsletterEmails"] = emails

    row.state = state
    row.revision = int(row.revision or 0) + 1
    row.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(row)

    return {"ok": True, "revision": int(row.revision or 0), "updatedAt": _iso(row.updated_at)}


@router.post("/reviews")
def add_review(req: ReviewCreateRequest, db: Session = Depends(get_db)):
    product_id = str(req.productId or "").strip()
    if not product_id:
        raise HTTPException(status_code=400, detail="product_id_required")

    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})

    reviews = state.get("reviewsByProduct")
    reviews = reviews if isinstance(reviews, dict) else {}

    current = reviews.get(product_id)
    current = current if isinstance(current, list) else []

    review = {
        "id": _safe_uuid("review"),
        "ts": int(datetime.utcnow().timestamp() * 1000),
        "rating": int(req.rating),
        "name": str(req.name or "").strip(),
        "text": str(req.text or "").strip(),
    }

    reviews[product_id] = [review, *current][:200]
    state["reviewsByProduct"] = reviews

    row.state = state
    row.revision = int(row.revision or 0) + 1
    row.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(row)

    return {"ok": True, "revision": int(row.revision or 0), "updatedAt": _iso(row.updated_at)}


@router.get("/order-status", response_model=OrderStatusLookupResponse)
def order_status_lookup(
    order_number: str = Query(min_length=3, max_length=60, alias="orderNumber"),
    db: Session = Depends(get_db),
):
    q = str(order_number or "").strip().lower()

    row = db.get(AppState, 1)
    if not row:
        return {"found": False, "order": None}

    state: dict[str, Any] = dict(row.state or {})
    orders = state.get("orders")
    orders = orders if isinstance(orders, list) else []

    for o in orders:
        if not isinstance(o, dict):
            continue
        on = str(o.get("orderNumber") or "").strip().lower()
        if on and on == q:
            return {"found": True, "order": o}

    return {"found": False, "order": None}


@router.post("/order-cancel-request")
def order_cancel_request(req: OrderCancelRequest, db: Session = Depends(get_db)):
    q = str(req.orderNumber or "").strip().lower()
    reason = str(req.reason or "").strip()

    if not q or not reason:
        raise HTTPException(status_code=400, detail="invalid_request")

    row = _get_row(db)
    state: dict[str, Any] = dict(row.state or {})
    orders = state.get("orders")
    orders = orders if isinstance(orders, list) else []

    found = False
    now_ms = int(datetime.utcnow().timestamp() * 1000)

    next_orders = []
    for o in orders:
        if not isinstance(o, dict):
            next_orders.append(o)
            continue

        on = str(o.get("orderNumber") or "").strip().lower()
        if on == q:
            found = True
            next_orders.append(
                {
                    **o,
                    "customerCancelRequestReason": reason,
                    "customerCancelRequestedAt": now_ms,
                    "updatedAt": now_ms,
                }
            )
        else:
            next_orders.append(o)

    if not found:
        raise HTTPException(status_code=404, detail="not_found")

    state["orders"] = next_orders

    row.state = state
    row.revision = int(row.revision or 0) + 1
    row.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(row)

    return {"ok": True, "revision": int(row.revision or 0), "updatedAt": _iso(row.updated_at)}
