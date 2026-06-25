from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


# Each sale generates one row — no limit on orders.
# Stores a snapshot of the product name and price at the time of purchase,
# so if the product changes later, old orders remain accurate.
# Includes customer info, shipping, and product personalization as JSON.
class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)  # UUID
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False, default=0)
    category = Column(String)
    name = Column(JSON)                     # {es, en} snapshot at time of sale
    personalization = Column(JSON)          # {text, verse, font, color}
    customer = Column(JSON, nullable=False) # {name, phone, notes}
    shipping = Column(JSON, nullable=False) # {addressLine1, addressLine2, city, stateRegion, postalCode, country}

    product = relationship("Product")
