from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class PlaceOrderItem(BaseModel):
    productId: str
    qty: int = Field(ge=1)
    unitPrice: float = Field(ge=0)

    # Snapshot fields (as stored by the frontend today)
    name: Any = None
    category: Optional[str] = None
    personalization: Any = None


class PlaceOrderRequest(BaseModel):
    items: list[PlaceOrderItem] = Field(min_length=1)

    customer: dict[str, Any]
    shipping: dict[str, Any]

    paymentMethod: str = "card"  # "card" | "paypal"

    taxRatePct: Optional[float] = None
    taxStateRatePct: Optional[float] = None
    taxMunicipalRatePct: Optional[float] = None
    shippingFee: Optional[float] = None


class PlaceOrderResponse(BaseModel):
    ok: bool = True
    revision: int
    updatedAt: Optional[str] = None

    # The created order (shape matches the frontend's existing order object)
    order: dict[str, Any]

    # Updated subsets that the storefront/admin UIs commonly need right away
    inventory: Optional[dict[str, Any]] = None
    orders: Optional[list[Any]] = None
    sales: Optional[list[Any]] = None
    newsletterEmails: Optional[list[str]] = None
