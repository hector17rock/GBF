from sqlalchemy import Column, String, Numeric, JSON
from app.database import Base


# One product per row, no limit. New categories (Yeti, Journals, etc.)
# are added here automatically. Bilingual texts (es/en) are stored as JSON.
class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)  # slug: "yeti-20"
    category = Column(String, nullable=False)
    name = Column(JSON, nullable=False)         # {es, en}
    price = Column(Numeric(10, 2), nullable=False)
    short = Column(JSON)                        # {es, en}
    description = Column(JSON)                  # {es, en}
    image = Column(String)
    tags = Column(JSON, default=list)           # [{es, en}, ...]
