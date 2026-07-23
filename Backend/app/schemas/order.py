"""
Pydantic schemas for the Order resource.

Mirrors the shapes already used by the frontend's checkout flow
(Frontend/src/utils/checkout.js and Frontend/src/pages/ProductDetail.jsx):

    customer         -> {name, phone, notes}
    shipping         -> {addressLine1, addressLine2, city, stateRegion,
                          postalCode, country}
    personalization  -> {text, verse, font, color}

Security note: the frontend's checkout draft also has a `card` object
(name, number, expiry, cvc, zip). That object is intentionally NOT part
of any schema here — raw card numbers must never reach this API or this
database. Card payments go through Stripe's client-side tokenization
instead (see the Stripe integration step, once we get there); this
backend only ever sees a Stripe token/payment intent id, never a PAN.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_serializer

from app.schemas.common import Localized


class Customer(BaseModel):
    name: str
    phone: str
    notes: Optional[str] = ""


class Shipping(BaseModel):
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state_region: str
    postal_code: str
    country: str


class Personalization(BaseModel):
    text: Optional[str] = ""
    verse: Optional[str] = ""
    font: Optional[str] = None
    color: Optional[str] = None


class OrderCreate(BaseModel):
    """
    What the frontend sends when the customer places an order.

    Notice there's no `unit_price`, `unit_cost`, `name`, or `category`
    here — those are snapshots the backend fills in itself by looking up
    the current Product row at the moment of purchase (see the /orders
    route). The client shouldn't be trusted to tell us the price; it
    only tells us WHAT was bought and HOW MANY.
    """

    product_id: str
    qty: int
    personalization: Personalization
    customer: Customer
    shipping: Shipping


class OrderOut(BaseModel):
    """
    What the API returns for an existing order — includes the price/cost
    snapshot and the name snapshot, both frozen at purchase time so the
    order stays accurate even if the product is later renamed or
    repriced.
    """

    id: str
    created_at: datetime
    product_id: str
    qty: int
    unit_price: Decimal
    unit_cost: Decimal
    category: Optional[str] = None
    name: Optional[Localized] = None
    personalization: Optional[Personalization] = None
    customer: Customer
    shipping: Shipping

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("unit_price", "unit_cost")
    def serialize_money(self, value: Decimal) -> float:
        return float(value)
