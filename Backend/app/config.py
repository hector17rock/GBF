"""
Central app configuration.

All settings are read from environment variables (or a local `.env` file
during development). Nothing sensitive is hardcoded here — this file only
declares *what* settings exist, their types, and safe defaults for the
non-sensitive ones.

Usage anywhere else in the backend:

    from app.config import settings
    print(settings.database_url)
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    app_name: str = "GBF Backend"
    environment: str = "development"  # "development" | "production"
    debug: bool = True

    # --- Database ---
    # Example: postgresql+psycopg2://user:password@localhost:5432/gbf
    database_url: str

    # --- CORS ---
    # Comma-separated list of allowed origins for the frontend, e.g.
    # "http://localhost:5173,https://tu-tienda.com"
    cors_origins: str = "http://localhost:5173"

    # --- Stripe ---
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Turn the comma-separated CORS string into a clean list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance — env vars are read once, not on every request.
    """
    return Settings()


settings = get_settings()
