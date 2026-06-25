from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# One row per product — no limit on products.
# Example:
#   product_id  | stock
#   "yeti-20"   | 5
#   "journal-1" | 12
#   "yeti-30"   | 0
# Stock is decremented automatically when a sale is registered.
class Inventory(Base):
    __tablename__ = "inventory"

    product_id = Column(String, ForeignKey("products.id"), primary_key=True)
    stock = Column(Integer, nullable=False, default=0)

    product = relationship("Product")


# One row per product with its unit cost (what the store pays).
# Used to calculate profit: selling_price - unit_cost = profit.
class ProductCost(Base):
    __tablename__ = "product_costs"

    product_id = Column(String, ForeignKey("products.id"), primary_key=True)
    unit_cost = Column(Numeric(10, 2), nullable=False, default=0)

    product = relationship("Product")
