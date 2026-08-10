#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_URL="${API_URL:-http://localhost:8000}"

if [[ ! -f .admin_credentials ]]; then
  echo "Missing .admin_credentials (needed for login)." >&2
  exit 2
fi

# Export admin credentials without printing them.
set -a
. ./.admin_credentials
set +a

# --- helpers ---
json_get() {
  python3 -c 'import json,sys; j=json.load(sys.stdin); import functools
path=sys.argv[1].split(".")
cur=j
for k in path:
  if isinstance(cur, dict) and k in cur:
    cur=cur[k]
  else:
    cur=None
    break
print(json.dumps(cur, ensure_ascii=False))' "$1"
}

# --- 1) health ---
curl -sS -f "${API_URL%/}/health" >/dev/null

# --- 2) login (do not print token) ---
TMP_LOGIN="$(mktemp)"
trap 'rm -f "$TMP_LOGIN"' EXIT
printf '{"username":"%s","password":"%s"}' "$ADMIN_USERNAME" "$ADMIN_PASSWORD" > "$TMP_LOGIN"

TOKEN=$(curl -sS -X POST "${API_URL%/}/auth/login" \
  -H "Content-Type: application/json" \
  --data-binary "@$TMP_LOGIN" \
  | python3 -c 'import sys,json; j=json.load(sys.stdin); t=j.get("token");
if not isinstance(t,str) or not t.strip():
  raise SystemExit(1)
print(t.strip())')

# --- 3) /auth/me ---
ME=$(curl -sS "${API_URL%/}/auth/me" -H "Authorization: Bearer ${TOKEN}")
ME_OK=$(printf "%s" "$ME" | python3 -c 'import sys,json; j=json.load(sys.stdin); ok=isinstance(j,dict) and bool(j.get("id")) and bool(j.get("username")); print("true" if ok else "false")')
if [[ "$ME_OK" != "true" ]]; then
  echo "FAIL: /auth/me did not return expected admin user object" >&2
  exit 1
fi

# --- 4) read admin state (full) ---
STATE_JSON=$(curl -sS "${API_URL%/}/state/admin" -H "Authorization: Bearer ${TOKEN}")
REV=$(printf "%s" "$STATE_JSON" | json_get revision | python3 -c 'import sys,json; print(int(json.load(sys.stdin) or 0))')
HERO=$(printf "%s" "$STATE_JSON" | json_get state.heroConfig)

if [[ "$REV" -lt 0 ]]; then
  echo "FAIL: revision was invalid" >&2
  exit 1
fi

# --- 5) write admin state (no semantic change): patch heroConfig to itself ---
PUT_RES=$(curl -sS -X PUT "${API_URL%/}/state/admin" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "$(python3 -c 'import json,sys; hero=json.loads(sys.argv[1]); rev=int(sys.argv[2]);
print(json.dumps({"replace": False, "expectedRevision": rev, "patch": {"heroConfig": hero}}, ensure_ascii=False))' "$HERO" "$REV")")

OK=$(printf "%s" "$PUT_RES" | json_get ok | python3 -c 'import sys,json; print("true" if json.load(sys.stdin) is True else "false")')
if [[ "$OK" != "true" ]]; then
  echo "FAIL: PUT /state/admin did not return ok=true" >&2
  exit 1
fi

NEW_REV=$(printf "%s" "$PUT_RES" | json_get revision | python3 -c 'import sys,json; print(int(json.load(sys.stdin) or 0))')
if [[ "$NEW_REV" -ne $((REV + 1)) ]]; then
  echo "FAIL: expected revision to increment (expected $((REV+1)), got $NEW_REV)" >&2
  exit 1
fi

# --- 6) unchanged polling behavior ---
UNCHANGED=$(curl -sS "${API_URL%/}/state/admin?ifRevision=${NEW_REV}" -H "Authorization: Bearer ${TOKEN}" \
  | json_get unchanged | python3 -c 'import sys,json; print("true" if json.load(sys.stdin) is True else "false")')
if [[ "$UNCHANGED" != "true" ]]; then
  echo "FAIL: expected unchanged=true when polling with matching ifRevision" >&2
  exit 1
fi

# --- 7) revision conflict behavior ---
HTTP_CONFLICT=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "${API_URL%/}/state/admin" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "$(python3 -c 'import json,sys; hero=json.loads(sys.argv[1]); rev=int(sys.argv[2]);
print(json.dumps({"replace": False, "expectedRevision": rev, "patch": {"heroConfig": hero}}, ensure_ascii=False))' "$HERO" "$REV")")
if [[ "$HTTP_CONFLICT" != "409" ]]; then
  echo "FAIL: expected 409 on stale expectedRevision, got $HTTP_CONFLICT" >&2
  exit 1
fi

# --- 8) admin-users CRUD (create + delete) ---
RAND=$(python3 -c 'import secrets; print(secrets.token_hex(6))')
NEW_USER="smoke_${RAND}"
NEW_PASS=$(python3 -c 'import secrets; print(secrets.token_hex(16))')

HTTP_CREATE=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${API_URL%/}/admin-users" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "$(python3 -c 'import json,sys; u=sys.argv[1]; p=sys.argv[2];
print(json.dumps({"name": "Smoke Test", "username": u, "password": p}, ensure_ascii=False))' "$NEW_USER" "$NEW_PASS")")
if [[ "$HTTP_CREATE" != "200" ]]; then
  echo "FAIL: expected 200 creating admin user, got $HTTP_CREATE" >&2
  exit 1
fi

USERS_JSON=$(curl -sS "${API_URL%/}/admin-users" -H "Authorization: Bearer ${TOKEN}")
NEW_ID=$(printf "%s" "$USERS_JSON" | python3 -c 'import sys,json; rows=json.load(sys.stdin); u=sys.argv[1];
uid="";
for r in rows:
  if str(r.get("username",""))==u:
    uid=str(r.get("id",""));
print(uid)' "$NEW_USER")

if [[ -z "$NEW_ID" ]]; then
  echo "FAIL: created admin user not found in list" >&2
  exit 1
fi

HTTP_DEL=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "${API_URL%/}/admin-users/${NEW_ID}" \
  -H "Authorization: Bearer ${TOKEN}")
if [[ "$HTTP_DEL" != "200" ]]; then
  echo "FAIL: expected 200 deleting admin user, got $HTTP_DEL" >&2
  exit 1
fi

# --- 9) uploads (API + static serving) ---
TMP_IMG="$(mktemp -t gbf_admin_ui_XXXXXX).png"
export TMP_IMG
python3 - <<'PY'
import base64, os
b = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X7pQAAAABJRU5ErkJggg==')
open(os.environ['TMP_IMG'],'wb').write(b)
PY

UPLOAD_JSON=$(curl -sS -X POST "${API_URL%/}/api/uploads/images" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${TMP_IMG};type=image/png" \
  -F "filename=admin-ui-smoke.png")

rm -f "$TMP_IMG"

UPLOADED_PATH=$(printf "%s" "$UPLOAD_JSON" | python3 -c 'import sys,json; j=json.load(sys.stdin); print(j.get("url",""))')
if [[ -z "$UPLOADED_PATH" ]]; then
  echo "FAIL: upload response missing url" >&2
  exit 1
fi

HTTP_FILE=$(curl -sS -o /dev/null -w "%{http_code}" "${API_URL%/}${UPLOADED_PATH}")
if [[ "$HTTP_FILE" != "200" ]]; then
  echo "FAIL: uploaded file not served back (expected 200, got $HTTP_FILE)" >&2
  exit 1
fi

echo "OK: Admin mode end-to-end contract checks passed (auth, state read/write, conflict, admin-users CRUD, uploads)."
