from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime

from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True)  # uuid
    username = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)

    algo = Column(String, nullable=False, default="pbkdf2_sha256")
    iterations = Column(Integer, nullable=False, default=200_000)
    salt = Column(String, nullable=False)  # hex
    hash = Column(String, nullable=False)  # hex

    # NOTE: store naive UTC datetimes for SQLite compatibility
    created_at = Column(
        DateTime(timezone=False),
        default=datetime.utcnow,
        nullable=False,
    )
