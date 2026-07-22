from __future__ import annotations

import getpass
import secrets
import sys
from pathlib import Path

# Ensure `app.*` imports work regardless of where this script is launched from.
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_BACKEND_ROOT))

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
import app.models  # noqa: F401
from app.models.admin_user import AdminUser
from app.services.admin_auth import hash_password_pbkdf2_sha256


def prompt(text: str) -> str:
    return input(text).strip()


def ensure_tables() -> None:
    Base.metadata.create_all(bind=engine)


def upsert_master_admin(db: Session, *, name: str, username: str, password: str, force: bool) -> str:
    u = username.strip()
    n = name.strip() or u

    if not u:
        raise ValueError("username_required")
    if not password.strip():
        raise ValueError("password_required")

    existing = db.query(AdminUser).filter(AdminUser.username.ilike(u)).first()

    if existing:
        if not force:
            return "exists"

        pw = hash_password_pbkdf2_sha256(password)
        existing.name = n
        existing.username = u
        existing.algo = pw["algo"]
        existing.iterations = pw["iterations"]
        existing.salt = pw["salt"]
        existing.hash = pw["hash"]
        db.commit()
        return "updated"

    # If there are already admins, we avoid adding a new master unless forced.
    count = db.query(AdminUser).count()
    if count > 0 and not force:
        return "blocked"

    pw = hash_password_pbkdf2_sha256(password)

    user = AdminUser(
        id=secrets.token_hex(16),
        username=u,
        name=n,
        algo=pw["algo"],
        iterations=pw["iterations"],
        salt=pw["salt"],
        hash=pw["hash"],
    )

    db.add(user)
    db.commit()
    return "created"


def main() -> int:
    print("GBF — bootstrap master admin")
    print("This will create/update an admin user in the backend database.")
    print("Password is requested via a hidden prompt (not echoed).\n")

    ensure_tables()

    name = prompt("Name: ")
    username = prompt("Username: ")
    password = getpass.getpass("Password (hidden): ")

    force_answer = prompt("Force update/reset if exists? (y/N): ").lower()
    force = force_answer in ("y", "yes")

    db = SessionLocal()
    try:
        result = upsert_master_admin(db, name=name, username=username, password=password, force=force)
    finally:
        db.close()

    if result == "created":
        print("\nOK: admin created.")
        return 0
    if result == "updated":
        print("\nOK: admin updated.")
        return 0
    if result == "exists":
        print("\nAdmin already exists. Re-run and choose force if you want to reset it.")
        return 2
    if result == "blocked":
        print("\nAdmins already exist. Re-run and choose force if you really want to add this user.")
        return 2

    print("\nUnexpected result:", result)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
