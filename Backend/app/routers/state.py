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

    next_state = {} if req.replace else dict(row.state or {})

    for k, v in req.patch.items():
        next_state[str(k)] = v

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
