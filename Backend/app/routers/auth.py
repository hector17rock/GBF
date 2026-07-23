from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps.admin import require_admin
from app.models.admin_user import AdminUser
from app.models.admin_session import AdminSession
from app.schemas.auth import (
    BootstrapAdminRequest,
    LoginRequest,
    AuthResponse,
    HasAdminsResponse,
    AdminUserPublic,
)
from app.services.admin_auth import (
    hash_password_pbkdf2_sha256,
    verify_password,
    new_session_token,
    session_expiry,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _require_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="missing_authorization")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=401, detail="invalid_authorization")

    return parts[1].strip()


@router.get("/has-admins", response_model=HasAdminsResponse)
def has_admins(db: Session = Depends(get_db)):
    count = db.query(AdminUser).count()
    return {"hasAdmins": count > 0}


@router.post("/bootstrap", response_model=AuthResponse)
def bootstrap_admin(req: BootstrapAdminRequest, db: Session = Depends(get_db)):
    # Only allow creating the first admin.
    existing = db.query(AdminUser).count()
    if existing > 0:
        raise HTTPException(status_code=409, detail="admins_already_configured")

    # Token gate (required always). This endpoint should only be used by a server admin.
    expected = str(settings.admin_bootstrap_token or "").strip()
    provided = str(req.bootstrap_token or "").strip()

    if not expected:
        raise HTTPException(status_code=500, detail="bootstrap_token_not_configured")

    if provided != expected:
        raise HTTPException(status_code=401, detail="invalid_bootstrap_token")

    username = req.username.strip()
    name = req.name.strip()

    pw = hash_password_pbkdf2_sha256(req.password)

    user = AdminUser(
        id=secrets.token_hex(16),
        username=username,
        name=name,
        algo=pw["algo"],
        iterations=pw["iterations"],
        salt=pw["salt"],
        hash=pw["hash"],
    )

    db.add(user)

    session = AdminSession(
        token=new_session_token(),
        user_id=user.id,
        expires_at=session_expiry(),
    )

    db.add(session)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "token": session.token,
        "user": {"id": user.id, "username": user.username, "name": user.name},
    }


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    username = req.username.strip().lower()

    user = (
        db.query(AdminUser)
        .filter(AdminUser.username.ilike(username))
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    ok = verify_password(
        req.password,
        algo=str(user.algo),
        salt_hex=str(user.salt),
        expected_hash_hex=str(user.hash),
        iterations=int(user.iterations or 0),
    )

    if not ok:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    sess = AdminSession(
        token=new_session_token(),
        user_id=user.id,
        expires_at=session_expiry(),
    )

    db.add(sess)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "token": sess.token,
        "user": {"id": user.id, "username": user.username, "name": user.name},
    }


@router.get("/me", response_model=AdminUserPublic)
def me(current: AdminUser = Depends(require_admin)):
    return {"id": current.id, "username": current.username, "name": current.name}


@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    token = _require_token(authorization)
    sess = db.get(AdminSession, token)
    if sess:
        try:
            db.delete(sess)
            db.commit()
        except Exception:
            db.rollback()

    return {"ok": True}
