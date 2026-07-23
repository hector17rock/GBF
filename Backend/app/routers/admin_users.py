from __future__ import annotations

import secrets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.admin import require_admin
from app.models.admin_user import AdminUser
from app.models.admin_session import AdminSession
from app.services.admin_auth import hash_password_pbkdf2_sha256

router = APIRouter(prefix="/admin-users", tags=["admin-users"])


class AdminCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    username: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=1, max_length=200)


class AdminUpdateName(BaseModel):
    name: str = Field(min_length=1, max_length=120)


@router.get("")
def list_admins(db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    rows = db.query(AdminUser).order_by(AdminUser.created_at.asc()).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "name": u.name,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        }
        for u in rows
    ]


@router.post("")
def create_admin(req: AdminCreate, db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    username = req.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="username_required")

    exists = db.query(AdminUser).filter(AdminUser.username.ilike(username)).first()
    if exists:
        raise HTTPException(status_code=409, detail="username_exists")

    pw = hash_password_pbkdf2_sha256(req.password)

    user = AdminUser(
        id=secrets.token_hex(16),
        username=username,
        name=req.name.strip() or username,
        algo=pw["algo"],
        iterations=pw["iterations"],
        salt=pw["salt"],
        hash=pw["hash"],
    )

    db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"ok": True, "id": user.id}


@router.patch("/{user_id}")
def update_admin_name(user_id: str, req: AdminUpdateName, db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    uid = str(user_id or "").strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id_required")

    user = db.get(AdminUser, uid)
    if not user:
        raise HTTPException(status_code=404, detail="not_found")

    user.name = req.name.strip()

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"ok": True}


@router.delete("/{user_id}")
def delete_admin(user_id: str, db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    uid = str(user_id or "").strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id_required")

    count = db.query(AdminUser).count()
    if count <= 1:
        raise HTTPException(status_code=409, detail="cannot_delete_last_admin")

    user = db.get(AdminUser, uid)
    if not user:
        raise HTTPException(status_code=404, detail="not_found")

    # Remove any sessions for this user
    db.query(AdminSession).filter(AdminSession.user_id == uid).delete()
    db.delete(user)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"ok": True}
