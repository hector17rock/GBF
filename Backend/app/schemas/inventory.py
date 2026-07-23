"""
Pydantic schemas for stock and cost tracking.

Mirrors app/models/inventory.py, which keeps Inventory and ProductCost
together in one file since they're both simple "one row per product"
lookup tables — this schema file follows that same pairing.
"""

from decimal import Decimal

from pydantic import ConfigDict, field_serializer

from app.schemas.common import CamelModel


class InventoryOut(CamelModel):
    product_id: str
    stock: int

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class InventoryUpdate(CamelModel):
    """
    Body for adjusting stock — e.g. the admin restocks or corrects a
    count. Kept separate from InventoryOut so the admin can't send
    fields we don't want them setting directly (like product_id, which
    comes from the URL path instead — /inventory/{product_id}).
    """

    stock: int


class ProductCostOut(CamelModel):
    product_id: str
    unit_cost: Decimal

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("unit_cost")
    def serialize_cost(self, value: Decimal) -> float:
        return float(value)


class ProductCostUpdate(CamelModel):
    unit_cost: Decimal
