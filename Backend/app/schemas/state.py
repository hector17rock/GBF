from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class StatePublicResponse(BaseModel):
    revision: int
    updatedAt: Optional[str] = None
    empty: bool = True
    unchanged: bool = False

    # Public storefront data (shapes match the frontend's state)
    heroConfig: Optional[dict[str, Any]] = None
    categories: Optional[list[Any]] = None
    products: Optional[list[Any]] = None
    inventory: Optional[dict[str, Any]] = None
    checkoutConfig: Optional[dict[str, Any]] = None
    policiesConfig: Optional[dict[str, Any]] = None
    reviewsByProduct: Optional[dict[str, Any]] = None


class StateAdminResponse(BaseModel):
    revision: int
    updatedAt: Optional[str] = None
    empty: bool = True
    unchanged: bool = False

    state: dict[str, Any] = Field(default_factory=dict)


class StateUpdateRequest(BaseModel):
    # If true, replace the entire stored state with `patch`.
    # If false, only the keys present in `patch` are replaced/updated.
    replace: bool = False

    # Optional optimistic concurrency.
    expectedRevision: Optional[int] = None

    # Top-level keys to write to the server state.
    patch: dict[str, Any] = Field(default_factory=dict)


class StateUpdateResponse(BaseModel):
    ok: bool = True
    revision: int
    updatedAt: Optional[str] = None
