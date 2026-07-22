"""
Database connection setup.

This module owns three things every SQLAlchemy model in this app relies on:

- `engine`      : the actual connection to Postgres, built from settings.database_url
- `SessionLocal`: a factory that creates a new DB session per request
- `Base`        : the declarative base class all models inherit from
                  (see app/models/*.py — they all do `from app.database import Base`)

It also provides `get_db()`, a FastAPI dependency that hands each request its
own session and guarantees it gets closed afterwards, even if the request
raises an exception.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# echo=settings.debug prints every SQL statement to the console while
# developing — helpful for debugging, noisy in production (settings.debug
# is False there, so it's silent automatically).

connect_args = {}
if str(settings.database_url).startswith("sqlite"):
    # Needed for SQLite + FastAPI dev reload.
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.database_url, echo=settings.debug, connect_args=connect_args)

# autocommit=False, autoflush=False: we control exactly when changes hit the
# DB (via db.commit() in each route) instead of SQLAlchemy guessing for us.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency — yields a DB session for the lifetime of one request.

    Usage in a route:

        from fastapi import Depends
        from app.database import get_db

        @app.get("/products")
        def list_products(db: Session = Depends(get_db)):
            return db.query(Product).all()

    The `try/finally` guarantees db.close() runs even if the route raises,
    so we never leak open connections.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
