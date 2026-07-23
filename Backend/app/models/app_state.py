from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, JSON

from app.database import Base


class AppState(Base):
    __tablename__ = "app_state"

    # singleton row (always id=1)
    id = Column(Integer, primary_key=True, default=1)

    revision = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)

    # Stores the frontend's state shape as-is (JSON object)
    state = Column(JSON, nullable=False, default=dict)
