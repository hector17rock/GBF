from sqlalchemy import Column, Integer, Boolean, String, JSON
from app.database import Base


# Singleton table — always one row with id=1.
# Controls the hero banner on the storefront: content, promo schedule,
# bilingual texts, button labels, and images.
class HeroConfig(Base):
    __tablename__ = "hero_config"

    id = Column(Integer, primary_key=True, default=1)  # singleton, always id=1
    enabled = Column(Boolean, nullable=False, default=False)
    promo_type = Column(String, default="content")      # "content" | "promo"
    promo_schedule = Column(JSON)                       # {startLocal, endLocal}
    pill = Column(JSON)                                 # {es, en}
    title_one = Column(JSON)                            # {es, en}
    title_two = Column(JSON)                            # {es, en}
    text = Column(JSON)                                 # {es, en}
    primary = Column(JSON)                              # {es, en}
    secondary = Column(JSON)                            # {es, en}
    images = Column(JSON)                               # {hero, product1, product2}
