from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta


PBKDF2_ITERATIONS_DEFAULT = 200_000
SESSION_DAYS_DEFAULT = 30


def now_utc() -> datetime:
    # SQLite does not reliably round-trip tz-aware datetimes.
    # Use naive UTC consistently across the app.
    return datetime.utcnow()


def hash_password_pbkdf2_sha256(password: str, *, salt_hex: str | None = None, iterations: int = PBKDF2_ITERATIONS_DEFAULT):
    pw = str(password or "")
    if not pw.strip():
        raise ValueError("password_required")

    if salt_hex is None:
        salt = secrets.token_bytes(16)
        salt_hex = salt.hex()
    else:
        salt = bytes.fromhex(salt_hex)

    dk = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, int(iterations))
    return {
        "algo": "pbkdf2_sha256",
        "iterations": int(iterations),
        "salt": salt_hex,
        "hash": dk.hex(),
    }


def verify_password(password: str, *, algo: str, salt_hex: str, expected_hash_hex: str, iterations: int) -> bool:
    pw = str(password or "")
    if algo != "pbkdf2_sha256":
        return False

    try:
        computed = hash_password_pbkdf2_sha256(pw, salt_hex=salt_hex, iterations=int(iterations))
        return hmac.compare_digest(str(computed["hash"]), str(expected_hash_hex))
    except Exception:
        return False


def new_session_token() -> str:
    # Opaque token; stored server-side (DB)
    return secrets.token_urlsafe(48)


def session_expiry(days: int = SESSION_DAYS_DEFAULT) -> datetime:
    return now_utc() + timedelta(days=int(days))
