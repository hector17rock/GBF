#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_URL="${API_URL:-http://localhost:8000}"

if [[ ! -f .env ]]; then
  echo "Missing .env (expected at repo root)." >&2
  exit 2
fi

if [[ ! -f .admin_credentials ]]; then
  echo "Missing .admin_credentials (generated during bootstrap)." >&2
  exit 2
fi

# Export env vars from files without printing them.
set -a
. ./.env
. ./.admin_credentials
set +a

# 1) DB reachable: has-admins
HAS_ADMINS=$(curl -sS "${API_URL%/}/auth/has-admins" | python3 -c 'import sys,json; j=json.load(sys.stdin); print("true" if bool(j.get("hasAdmins")) else "false")')

if [[ "$HAS_ADMINS" != "true" ]]; then
  echo "FAIL: /auth/has-admins returned hasAdmins=false" >&2
  exit 1
fi

# 2) Login (do not print response body; it includes token)
TMP_LOGIN="$(mktemp)"
trap 'rm -f "$TMP_LOGIN"' EXIT

cat > "$TMP_LOGIN" <<JSON
{"username":"${ADMIN_USERNAME}","password":"${ADMIN_PASSWORD}"}
JSON

TOKEN=$(curl -sS -X POST "${API_URL%/}/auth/login" \
  -H "Content-Type: application/json" \
  --data-binary "@$TMP_LOGIN" \
  | python3 -c 'import sys,json; j=json.load(sys.stdin); t=j.get("token");
if not isinstance(t,str) or not t.strip():
  raise SystemExit(1)
print(t.strip())')

# 3) /auth/me with token
ME_OK=$(curl -sS "${API_URL%/}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  | python3 -c 'import sys,json; j=json.load(sys.stdin); ok=isinstance(j,dict) and bool(j.get("id")) and bool(j.get("username")); print("true" if ok else "false")')

if [[ "$ME_OK" != "true" ]]; then
  echo "FAIL: /auth/me did not return expected user object" >&2
  exit 1
fi

# 4) Admin-only endpoints: verify 401 without token, and 200 with token
CODE_NO_TOKEN=$(curl -sS -o /dev/null -w "%{http_code}" "${API_URL%/}/state/admin")
if [[ "$CODE_NO_TOKEN" != "401" ]]; then
  echo "FAIL: /state/admin should require auth (expected 401, got $CODE_NO_TOKEN)" >&2
  exit 1
fi

CODE_WITH_TOKEN=$(curl -sS -o /dev/null -w "%{http_code}" "${API_URL%/}/state/admin" -H "Authorization: Bearer ${TOKEN}")
if [[ "$CODE_WITH_TOKEN" != "200" ]]; then
  echo "FAIL: /state/admin with token expected 200, got $CODE_WITH_TOKEN" >&2
  exit 1
fi

CODE_ADMIN_USERS=$(curl -sS -o /dev/null -w "%{http_code}" "${API_URL%/}/admin-users" -H "Authorization: Bearer ${TOKEN}")
if [[ "$CODE_ADMIN_USERS" != "200" ]]; then
  echo "FAIL: /admin-users with token expected 200, got $CODE_ADMIN_USERS" >&2
  exit 1
fi

# 5) Uploads: create tiny PNG, upload, then GET it back.
TMP_IMG="$(mktemp -t gbf_test_XXXXXX).png"
export TMP_IMG
python3 - <<'PY'
import base64, os
# 1x1 transparent PNG
b = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X7pQAAAABJRU5ErkJggg==')
open(os.environ['TMP_IMG'],'wb').write(b)
PY

UPLOAD_JSON=$(curl -sS -X POST "${API_URL%/}/api/uploads/images" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${TMP_IMG};type=image/png" \
  -F "filename=smoke-test.png")

UPLOADED_URL=$(printf "%s" "$UPLOAD_JSON" | python3 -c 'import sys,json; j=json.load(sys.stdin); print(j["url"])')

HTTP_FILE=$(curl -sS -o /dev/null -w "%{http_code}" "${API_URL%/}${UPLOADED_URL}")
if [[ "$HTTP_FILE" != "200" ]]; then
  echo "FAIL: uploaded file not served back (expected 200, got $HTTP_FILE)" >&2
  exit 1
fi

rm -f "$TMP_IMG"

echo "OK: admin backend smoke test passed (auth, admin endpoints, uploads)."
