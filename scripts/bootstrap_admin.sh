#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:8000}"

: "${ADMIN_BOOTSTRAP_TOKEN:?Set ADMIN_BOOTSTRAP_TOKEN}"
: "${ADMIN_USERNAME:?Set ADMIN_USERNAME}"
: "${ADMIN_NAME:?Set ADMIN_NAME}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD}"

TMP_BODY="$(mktemp)"
trap 'rm -f "$TMP_BODY"' EXIT

cat > "$TMP_BODY" <<JSON
{
  "bootstrap_token": "${ADMIN_BOOTSTRAP_TOKEN}",
  "username": "${ADMIN_USERNAME}",
  "name": "${ADMIN_NAME}",
  "password": "${ADMIN_PASSWORD}"
}
JSON

# Do not print response body (it contains an auth token).
HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" \
  -X POST "${API_URL%/}/auth/bootstrap" \
  -H "Content-Type: application/json" \
  --data-binary "@$TMP_BODY")

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "OK: first admin created. Now log in via /auth/login (UI or API)."
  exit 0
fi

echo "Bootstrap failed (HTTP $HTTP_CODE)." >&2
exit 1
