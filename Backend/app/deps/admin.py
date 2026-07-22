from __future__ import annotations

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin_session import AdminSession
from app.models.admin_user import AdminUser
from app.services.admin_auth import now_utc


def _require_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="missing_authorization")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=401, detail="invalid_authorization")

    return parts[1].strip()


def require_admin(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> AdminUser:
    token = _require_token(authorization)

    sess = db.get(AdminSession, token)
    if not sess:
        raise HTTPException(status_code=401, detail="invalid_session")

    if sess.expires_at and sess.expires_at < now_utc():
        try:
            db.delete(sess)
            db.commit()
        except Exception:
            db.rollback()
        raise HTTPException(status_code=401, detail="session_expired")

    user = db.get(AdminUser, sess.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="invalid_session_user")

    return user
