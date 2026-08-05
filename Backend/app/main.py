"""
FastAPI application entrypoint.

Run locally with:

uvicorn app.main:app -- reload

This is the only file that creates the 'app' object. its jobs is limited to:

1. Instantiatinf FastAPI
2. Wiring up CORS so the frontend (Hector's Vite dev server, and later the
production domain) is allowed to call this API from the browser
3. Registering routers (kept in app/routers/*.py - business logic for each 
resource lives there, not here, so this stays small and readable)
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
import app.models  # noqa: F401 (register models for create_all)

from app.routers import auth, admin_users, state, checkout, public, paypal, uploads

app = FastAPI(title=settings.app_name)

# --- DB + filesystem bootstrap ---
@app.on_event("startup")
def _startup_create_tables():
    # In production we rely on Alembic migrations (run during deploy/startup).
    # For local development, keep create_all so the API runs out-of-the-box.
    if str(settings.environment or "").lower() != "production":
        Base.metadata.create_all(bind=engine)

    # Ensure uploads directory exists so StaticFiles can serve it.
    try:
        Path(str(settings.uploads_dir or "uploads")).mkdir(parents=True, exist_ok=True)
    except Exception:
        pass


# Public static files for uploaded assets (mounted volume in production).
app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.uploads_dir or "uploads"), check_dir=False),
    name="uploads",
)


# --- CORS ---
# Browsers require explicit CORS approval. For local dev + phone testing,
# allow any origin (no cookies/credentials; we use Bearer tokens).

is_production = settings.environment.lower() == "production"

if is_production:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# --- Routers ---
app.include_router(auth.router)
app.include_router(admin_users.router)
app.include_router(state.router)
app.include_router(checkout.router)
app.include_router(public.router)
app.include_router(paypal.router)
app.include_router(uploads.router)

@app.get("/health")
def health_check():

    """
    Simple liveness check - confirms the API process is up.
    Does not touch the database on purpose, so iut stays fast abd reliable
    even if the DB has an issue (useful for hosting platfroms that ping
    this to decide whether to restart the app).
    """

    return {"status": "ok", "app": settings.app_name, "environment":
            settings.environment}

# --- Routers ---
# Each resource (products, orders, inventory, hero-config) gets its own
#router file in app/routers/. As we build them, we register them here:
#
# from app.routers import products, orders, inventory, hero_config
# app.include_router(products.router)
# app.include_router(orders.router)
# app.include_router(inventory.router)
# app.include_router(hero_config.router)


