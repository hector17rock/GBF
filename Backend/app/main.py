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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title=settings.app_name)

# --- CORS ---
# Without this, a browser running the frontend at http://localhost:5173
#blocks every request to this API with a CORS error - even though both
#run on the same machien. This isn.t optional in development.
#
#settings.cors_originis_list reads from CORS_ORIGINS in .env. e.g.:
#CORS_ORIGINS=http://localhost:5173,https://tu-tienda.com

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


