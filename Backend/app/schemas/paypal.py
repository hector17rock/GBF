from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class PayPalConfigResponse(BaseModel):
    configured: bool = False
    clientId: Optional[str] = None
    environment: str = "sandbox"  # sandbox | live
    currency: str = "USD"


class PayPalItem(BaseModel):
    productId: str
    qty: int = Field(ge=1)

    # Snapshot fields (stored with the order for receipts/admin views)
    name: Any = None
    category: Optional[str] = None
    personalization: Any = None


class PayPalCreateOrderRequest(BaseModel):
    items: list[PayPalItem] = Field(min_length=1)
    customer: dict[str, Any]
    shipping: dict[str, Any]


class PayPalCreateOrderResponse(BaseModel):
    ok: bool = True
    paypalOrderId: str

    # Optional computed totals (helpful for debugging/UI)
    currency: str = "USD"
    subtotal: float = 0.0
    taxAmount: float = 0.0
    shippingFee: float = 0.0
    total: float = 0.0


class PayPalCaptureOrderRequest(BaseModel):
    paypalOrderId: str
    items: list[PayPalItem] = Field(min_length=1)
    customer: dict[str, Any]
    shipping: dict[str, Any]


class PayPalCaptureOrderResponse(BaseModel):
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
