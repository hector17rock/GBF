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
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


_DEFAULT_SQLITE_PATH = (Path(__file__).resolve().parent.parent / "gbf.db").as_posix()
_DEFAULT_UPLOADS_DIR = (Path(__file__).resolve().parent.parent / "uploads").as_posix()


class Settings(BaseSettings):
    # --- App ---
    app_name: str = "GBF Backend"
    environment: str = "development"  # "development" | "production"
    debug: bool = True

    # --- Database ---
    # Example: postgresql+psycopg2://user:password@localhost:5432/gbf
    # Dev default keeps the backend runnable out-of-the-box.
    database_url: str = f"sqlite:///{_DEFAULT_SQLITE_PATH}"

    # --- Uploads ---
    # Where uploaded files are stored on disk. In production this should be a mounted volume.
    uploads_dir: str = _DEFAULT_UPLOADS_DIR

    # --- CORS ---
    # Comma-separated list of allowed origins for the frontend, e.g.
    # "http://localhost:5173,https://tu-tienda.com"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Admin bootstrap ---
    # If set (or in production), the first-admin bootstrap endpoint requires this token.
    admin_bootstrap_token: str = ""

    # --- Stripe ---
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # --- PayPal ---
    # Create sandbox/live API credentials at https://developer.paypal.com/
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_environment: str = "sandbox"  # "sandbox" | "live"
    paypal_currency: str = "USD"

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
