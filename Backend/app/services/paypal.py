from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import requests

from app.config import settings


@dataclass
class PayPalServiceError(Exception):
    code: str
    detail: Any = None


_token_cache: dict[str, Any] = {
    "access_token": None,
    "expires_at": 0.0,
}


def _paypal_base_url() -> str:
    env = str(settings.paypal_environment or "sandbox").strip().lower()
    if env == "live":
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"


def _configured() -> bool:
    return bool(str(settings.paypal_client_id or "").strip() and str(settings.paypal_client_secret or "").strip())


def get_access_token() -> str:
    if not _configured():
        raise PayPalServiceError("paypal_not_configured")

    now = time.time()
    token = _token_cache.get("access_token")
    expires_at = float(_token_cache.get("expires_at") or 0.0)

    # Refresh a bit early.
    if token and now < (expires_at - 30):
        return str(token)

    url = f"{_paypal_base_url()}/v1/oauth2/token"

    try:
        res = requests.post(
            url,
            auth=(settings.paypal_client_id, settings.paypal_client_secret),
            data={"grant_type": "client_credentials"},
            headers={"Accept": "application/json"},
            timeout=15,
        )
    except Exception as e:
        raise PayPalServiceError("paypal_auth_request_failed", str(e))

    data: Any = None
    try:
        data = res.json()
    except Exception:
        data = {"raw": res.text}

    if not res.ok:
        raise PayPalServiceError("paypal_auth_failed", data)

    access_token = str(data.get("access_token") or "").strip()
    if not access_token:
        raise PayPalServiceError("paypal_auth_missing_token", data)

    expires_in = 0
    try:
        expires_in = int(data.get("expires_in") or 0)
    except Exception:
        expires_in = 0

    _token_cache["access_token"] = access_token
    _token_cache["expires_at"] = now + max(0, expires_in)

    return access_token


def _paypal_request(method: str, path: str, *, json_body: Any | None = None, headers: dict[str, str] | None = None) -> Any:
    token = get_access_token()

    url = f"{_paypal_base_url()}{path}"
    h: dict[str, str] = {
        "Accept": "application/json",
        "Authorization": f"Bearer {token}",
    }
    if json_body is not None:
        h["Content-Type"] = "application/json"
    if headers:
        h.update({k: str(v) for k, v in headers.items()})

    try:
        res = requests.request(method, url, json=json_body, headers=h, timeout=20)
    except Exception as e:
        raise PayPalServiceError("paypal_request_failed", str(e))

    data: Any = None
    try:
        data = res.json()
    except Exception:
        data = {"raw": res.text}

    if not res.ok:
        raise PayPalServiceError("paypal_api_error", {"status": res.status_code, "body": data})

    return data


def create_order(
    *,
    total: float,
    currency: str,
    items: list[dict[str, Any]] | None = None,
    breakdown: dict[str, Any] | None = None,
    request_id: str | None = None,
) -> dict[str, Any]:
    value = f"{float(total):.2f}"

    amount: dict[str, Any] = {"currency_code": currency, "value": value}
    if breakdown:
        amount["breakdown"] = breakdown

    purchase_unit: dict[str, Any] = {
        "amount": amount,
    }
    if items:
        purchase_unit["items"] = items

    body: dict[str, Any] = {
        "intent": "CAPTURE",
        "purchase_units": [purchase_unit],
    }

    headers: dict[str, str] = {}
    if request_id:
        headers["PayPal-Request-Id"] = request_id

    return _paypal_request("POST", "/v2/checkout/orders", json_body=body, headers=headers)


def capture_order(*, paypal_order_id: str, request_id: str | None = None) -> dict[str, Any]:
    oid = str(paypal_order_id or "").strip()
    if not oid:
        raise PayPalServiceError("missing_paypal_order_id")

    headers: dict[str, str] = {}
    if request_id:
        headers["PayPal-Request-Id"] = request_id

    return _paypal_request("POST", f"/v2/checkout/orders/{oid}/capture", json_body={}, headers=headers)
