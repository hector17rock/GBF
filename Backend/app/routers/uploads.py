from __future__ import annotations

import secrets
import time
from pathlib import Path
import re

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import settings
from app.deps.admin import require_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


_ALLOWED_IMAGE_MIME_TO_EXT: dict[str, str] = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
}

_MAX_IMAGE_BYTES = 10_000_000  # ~10MB


def _safe_filename(value: str) -> str:
    s = str(value or "").strip()
    if not s:
        return ""

    # Keep only safe characters; avoid path traversal.
    s = re.sub(r"[^a-zA-Z0-9._-]+", "_", s)
    return Path(s).name


@router.post("/images")
async def upload_image(
    file: UploadFile = File(...),
    filename: str | None = Form(default=None),
    _: AdminUser = Depends(require_admin),
):
    mime = str(file.content_type or "").lower().strip()
    ext = _ALLOWED_IMAGE_MIME_TO_EXT.get(mime)
    if not ext:
        raise HTTPException(status_code=400, detail="unsupported_type")

    # Prefer the provided filename; fall back to the browser-supplied name.
    name_hint = _safe_filename(filename or file.filename or "")
    stem = Path(name_hint).stem.strip("._-") if name_hint else ""
    if not stem:
        stem = f"upload-{int(time.time() * 1000)}"

    final_name = f"{stem}.{ext}"

    uploads_root = Path(str(settings.uploads_dir or "uploads")).expanduser().resolve()
    images_dir = uploads_root / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    out_path = images_dir / final_name
    if out_path.exists():
        out_path = images_dir / f"{stem}-{secrets.token_hex(4)}.{ext}"

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="empty_file")

    if len(content) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="file_too_large")

    try:
        out_path.write_bytes(content)
    except Exception:
        raise HTTPException(status_code=500, detail="write_failed")

    return {"ok": True, "url": f"/uploads/images/{out_path.name}"}
