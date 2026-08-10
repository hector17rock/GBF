from __future__ import annotations

import json
import logging
import secrets
import time
from typing import Any

logger = logging.getLogger("gbf.ops")


def safe_event_id(prefix: str) -> str:
    return f"{prefix}-{int(time.time() * 1000)}-{secrets.token_hex(6)}"


def now_ms() -> int:
    return int(time.time() * 1000)


def append_activity_log(
    state: dict[str, Any],
    *,
    kind: str = "info",
    message_es: str = "",
    message_en: str = "",
    ts_ms: int | None = None,
    max_items: int = 200,
) -> dict[str, Any]:
    es = str(message_es or "").strip()
    en = str(message_en or "").strip()
    if not es and not en:
        return state

    base = state if isinstance(state, dict) else {}

    current = base.get("activityLog")
    current = current if isinstance(current, list) else []

    entry = {
        "id": safe_event_id("evt"),
        "ts": int(ts_ms if ts_ms is not None else now_ms()),
        "kind": str(kind or "info"),
        "message": {"es": es, "en": en},
    }

    base["activityLog"] = [entry, *current][: int(max_items) if int(max_items) > 0 else 200]
    return base


def log_event(name: str, **fields: Any) -> None:
    """Log an operational event as a single JSON blob.

    This is intentionally provider-agnostic (stdout). In production, ship these logs
    to a real log sink.
    """

    payload = {"event": str(name), **{k: v for k, v in fields.items() if v is not None}}
    try:
        logger.info(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    except Exception:
        # Last resort: don't crash request handling because of logging.
        try:
            logger.info("event=%s", str(name))
        except Exception:
            pass
