from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.admin import require_admin
from app.models.app_state import AppState
from app.schemas.state import (
    StateAdminResponse,
    StatePublicResponse,
    StateUpdateRequest,
    StateUpdateResponse,
)
from app.services.ops_events import append_activity_log, log_event, now_ms

router = APIRouter(prefix="/state", tags=["state"])


PUBLIC_KEYS = {
    "heroConfig",
    "categories",
    "products",
    "inventory",
    "checkoutConfig",
    "policiesConfig",
    "reviewsByProduct",
}


def _iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    try:
        return dt.isoformat()
    except Exception:
        return None


def _state_is_empty(state: dict[str, Any]) -> bool:
    products = state.get("products")
    categories = state.get("categories")
    orders = state.get("orders")
    hero = state.get("heroConfig")

    has_products = isinstance(products, list) and len(products) > 0
    has_categories = isinstance(categories, list) and len(categories) > 0
    has_orders = isinstance(orders, list) and len(orders) > 0
    has_hero = isinstance(hero, dict) and len(hero.keys()) > 0

    return not (has_products or has_categories or has_orders or has_hero)


def get_state_row(db: Session) -> AppState | None:
    return db.get(AppState, 1)


def ensure_state_row(db: Session) -> AppState:
    row = get_state_row(db)
    if row:
        return row

    row = AppState(id=1, revision=0, updated_at=datetime.utcnow(), state={})
    db.add(row)
    try:
        db.commit()
        db.refresh(row)
    except Exception:
        db.rollback()
        raise

    return row


@router.get("/public", response_model=StatePublicResponse)
def get_public_state(
    db: Session = Depends(get_db),
    if_revision: int | None = Query(default=None, alias="ifRevision"),
):
    row = get_state_row(db)

    if not row:
        return {
            "revision": 0,
            "updatedAt": None,
            "empty": True,
            "unchanged": False,
        }

    if if_revision is not None and int(if_revision) == int(row.revision or 0):
        return {
            "revision": int(row.revision or 0),
            "updatedAt": _iso(row.updated_at),
            "empty": _state_is_empty(row.state or {}),
            "unchanged": True,
        }

    state = row.state or {}
    out = {k: state.get(k) for k in PUBLIC_KEYS}

    return {
        "revision": int(row.revision or 0),
        "updatedAt": _iso(row.updated_at),
        "empty": _state_is_empty(state),
        "unchanged": False,
        **out,
    }


@router.get("/admin", response_model=StateAdminResponse)
def get_admin_state(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
    if_revision: int | None = Query(default=None, alias="ifRevision"),
):
    row = get_state_row(db)

    if not row:
        return {
            "revision": 0,
            "updatedAt": None,
            "empty": True,
            "unchanged": False,
            "state": {},
        }

    if if_revision is not None and int(if_revision) == int(row.revision or 0):
        return {
            "revision": int(row.revision or 0),
            "updatedAt": _iso(row.updated_at),
            "empty": _state_is_empty(row.state or {}),
            "unchanged": True,
            "state": {},
        }

    state = row.state or {}
    return {
        "revision": int(row.revision or 0),
        "updatedAt": _iso(row.updated_at),
        "empty": _state_is_empty(state),
        "unchanged": False,
        "state": state,
    }


@router.put("/admin", response_model=StateUpdateResponse)
def put_admin_state(
    req: StateUpdateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if not isinstance(req.patch, dict):
        raise HTTPException(status_code=400, detail="patch_required")

    row = ensure_state_row(db)

    current_revision = int(row.revision or 0)
    if req.expectedRevision is not None and int(req.expectedRevision) != current_revision:
        raise HTTPException(status_code=409, detail="revision_conflict")

    prev_state = dict(row.state or {})
    next_state = {} if req.replace else dict(prev_state)

    for k, v in req.patch.items():
        next_state[str(k)] = v

    # --- Operational notifications (log-only + activity log) ---
    # Detect order lifecycle changes when admin updates the orders array.
    # Skip on full replace to avoid noisy logs during initial migrations/sync.
    if not req.replace and "orders" in req.patch and isinstance(req.patch.get("orders"), list):
        prev_orders = prev_state.get("orders")
        prev_orders = prev_orders if isinstance(prev_orders, list) else []
        next_orders = req.patch.get("orders")
        next_orders = next_orders if isinstance(next_orders, list) else []

        def key(o: Any) -> str:
            if not isinstance(o, dict):
                return ""
            return str(o.get("orderNumber") or o.get("id") or "").strip()

        prev_by_key = {key(o): o for o in prev_orders if key(o)}

        for o in next_orders:
            k = key(o)
            if not k:
                continue
            prev = prev_by_key.get(k)
            if not isinstance(prev, dict) or not isinstance(o, dict):
                continue

            old_status = str(prev.get("status") or "").strip().lower()
            new_status = str(o.get("status") or "").strip().lower()

            old_tracking = str(prev.get("trackingNumber") or "").strip()
            new_tracking = str(o.get("trackingNumber") or "").strip()

            old_cancel = str(prev.get("cancelReason") or "").strip()
            new_cancel = str(o.get("cancelReason") or "").strip()

            changed = False

            if old_status != new_status and new_status:
                changed = True
                log_event("order_status_updated", orderNumber=k, fromStatus=old_status or None, toStatus=new_status)
                next_state = append_activity_log(
                    next_state,
                    kind="order",
                    message_es=f"Orden {k}: estatus {old_status or '—'} → {new_status}",
                    message_en=f"Order {k}: status {old_status or '—'} → {new_status}",
                    ts_ms=now_ms(),
                )

            if old_tracking != new_tracking and new_tracking:
                changed = True
                log_event("order_tracking_updated", orderNumber=k, trackingNumber=new_tracking)
                next_state = append_activity_log(
                    next_state,
                    kind="order",
                    message_es=f"Orden {k}: tracking actualizado → {new_tracking}",
                    message_en=f"Order {k}: tracking updated → {new_tracking}",
                    ts_ms=now_ms(),
                )

            if old_cancel != new_cancel and new_cancel:
                changed = True
                log_event("order_cancelled", orderNumber=k)
                next_state = append_activity_log(
                    next_state,
                    kind="order",
                    message_es=f"Orden {k}: cancelada — {new_cancel}",
                    message_en=f"Order {k}: cancelled — {new_cancel}",
                    ts_ms=now_ms(),
                )

            if changed:
                # keep scanning for other changes
                pass

    row.state = next_state
    row.revision = current_revision + 1
    row.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(row)
    except Exception:
        db.rollback()
        raise

    return {"ok": True, "revision": int(row.revision or 0), "updatedAt": _iso(row.updated_at)}
