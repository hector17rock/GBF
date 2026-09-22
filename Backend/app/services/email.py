from __future__ import annotations

import logging
from typing import Any

import requests

from app.config import settings

logger = logging.getLogger("gbf.email")

_RESEND_URL = "https://api.resend.com/emails"


def is_configured() -> bool:
    return bool(str(settings.resend_api_key or "").strip()) and bool(
        str(settings.order_notify_email or "").strip()
    )


def send_order_notification(order: dict[str, Any]) -> None:
    if not is_configured():
        return

    try:
        order_number = str(order.get("orderNumber") or "")
        total = order.get("total")
        payment_method = str(order.get("paymentMethod") or "")
        customer = order.get("customer") or {}
        customer_name = str(customer.get("name") or "")

        lines = []
        for it in order.get("items") or []:
            name = it.get("name")
            if isinstance(name, dict):
                name = name.get("es") or name.get("en") or ""
            lines.append(str(name) + " x" + str(it.get("qty")))

        body = "Orden: " + order_number + "\n"
        body += "Total: $" + str(total) + "\n"
        body += "Pago: " + payment_method + "\n"
        body += "Cliente: " + customer_name + "\n\n"
        body += "\n".join(lines)
        body += "\n\nEntra al panel de admin para ver los detalles completos."

        resp = requests.post(
            _RESEND_URL,
            headers={
                "Authorization": "Bearer " + str(settings.resend_api_key),
                "Content-Type": "application/json",
            },
            json={
                "from": settings.email_from or "GBF Store <onboarding@resend.dev>",
                "to": [settings.order_notify_email],
                "subject": "Nueva orden GBF: " + order_number,
                "text": body,
            },
            timeout=8,
        )
        if resp.status_code >= 400:
            logger.warning("resend_send_failed status=%s body=%s", resp.status_code, resp.text[:500])
    except Exception as exc:
        logger.warning("resend_send_exception error=%s", str(exc))
