from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    token = Column(String, primary_key=True)  # opaque session token
    user_id = Column(String, ForeignKey("admin_users.id"), nullable=False, index=True)

    # NOTE: store naive UTC datetimes for SQLite compatibility
    created_at = Column(
        DateTime(timezone=False),
        default=datetime.utcnow,
        nullable=False,
    )
    expires_at = Column(DateTime(timezone=False), nullable=False)

    user = relationship("AdminUser")
