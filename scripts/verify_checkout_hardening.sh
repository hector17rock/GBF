#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_URL="${API_URL:-http://localhost:8000}"

if [[ ! -f .admin_credentials ]]; then
  echo "Missing .admin_credentials (needed for admin login)." >&2
  exit 2
fi

set -a
. ./.admin_credentials
set +a

# Login (do not print token)
TMP_LOGIN="$(mktemp)"
trap 'rm -f "$TMP_LOGIN"' EXIT
printf '{"username":"%s","password":"%s"}' "$ADMIN_USERNAME" "$ADMIN_PASSWORD" > "$TMP_LOGIN"
TOKEN=$(curl -sS -X POST "${API_URL%/}/auth/login" -H "Content-Type: application/json" --data-binary "@$TMP_LOGIN" \
  | python3 -c 'import sys,json; j=json.load(sys.stdin); t=j.get("token");
if not isinstance(t,str) or not t.strip():
  raise SystemExit(1)
print(t.strip())')

# Read admin state
ADMIN_STATE=$(curl -sS "${API_URL%/}/state/admin" -H "Authorization: Bearer ${TOKEN}")

# Ensure we have at least one product, plus checkoutConfig + inventory for strict stock testing.
PATCH_JSON=$(printf "%s" "$ADMIN_STATE" | python3 -c '
import sys, json
j=json.load(sys.stdin)
st=j.get("state") if isinstance(j,dict) else {}
st = st if isinstance(st,dict) else {}
products=st.get("products")
products = products if isinstance(products,list) else []
categories=st.get("categories")
categories = categories if isinstance(categories,list) else []
inv=st.get("inventory")
inv = inv if isinstance(inv,dict) else {}
checkout=st.get("checkoutConfig")
checkout = checkout if isinstance(checkout,dict) else {}

patch={}

if not categories:
    patch["categories"]=["Default"]

if not products:
    pid="smoke-product"
    patch["products"]=[{
        "id": pid,
        "category": "Default",
        "name": {"es":"Producto Smoke","en":"Smoke Product"},
        "price": 25.0,
        "short": {"es":"Prueba","en":"Test"},
        "description": {"es":"Prueba","en":"Test"},
        "image": "https://example.com/image.jpg",
        "tags": []
    }]
    inv[pid]=1
    patch["inventory"]=inv
else:
    # Pick first product id and enforce managed inventory=1 for strict stock check
    pid=str((products[0] or {}).get("id") or "").strip()
    if pid:
        inv[pid]=1
        patch["inventory"]=inv

# Ensure checkout config exists for deterministic totals
if "prTaxStateRatePct" not in checkout:
    checkout["prTaxStateRatePct"]=0.0
if "prTaxMunicipalRatePct" not in checkout:
    checkout["prTaxMunicipalRatePct"]=0.0
if "defaultShippingFee" not in checkout:
    checkout["defaultShippingFee"]=0.0
patch["checkoutConfig"]=checkout

print(json.dumps(patch, ensure_ascii=False))
')

if [[ "$PATCH_JSON" != "{}" ]]; then
  curl -sS -X PUT "${API_URL%/}/state/admin" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary "$(python3 -c 'import json,sys; patch=json.loads(sys.argv[1]); print(json.dumps({"replace": False, "patch": patch}, ensure_ascii=False))' "$PATCH_JSON")" \
    >/dev/null
fi

# Fetch public state for product price + checkout rates
PUBLIC=$(curl -sS "${API_URL%/}/state/public")
PID=$(printf "%s" "$PUBLIC" | python3 -c 'import sys,json; j=json.load(sys.stdin); ps=j.get("products") or []; print((ps[0] or {}).get("id",""))')
PRICE=$(printf "%s" "$PUBLIC" | python3 -c 'import sys,json; j=json.load(sys.stdin); ps=j.get("products") or []; p=ps[0] if ps else {}; print(float(p.get("price") or 0.0))')
TAX_S=$(printf "%s" "$PUBLIC" | python3 -c 'import sys,json; j=json.load(sys.stdin); c=j.get("checkoutConfig") or {}; print(float(c.get("prTaxStateRatePct") or 0.0))')
TAX_M=$(printf "%s" "$PUBLIC" | python3 -c 'import sys,json; j=json.load(sys.stdin); c=j.get("checkoutConfig") or {}; print(float(c.get("prTaxMunicipalRatePct") or 0.0))')
SHIP=$(printf "%s" "$PUBLIC" | python3 -c 'import sys,json; j=json.load(sys.stdin); c=j.get("checkoutConfig") or {}; print(float(c.get("defaultShippingFee") or 0.0))')

if [[ -z "$PID" ]]; then
  echo "FAIL: no products available in public state after seeding" >&2
  exit 1
fi

# 1) Strict stock: qty 2 should fail (inventory managed as 1)
HTTP_OOS=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${API_URL%/}/checkout/place-order" \
  -H "Content-Type: application/json" \
  --data-binary "$(python3 - <<PY
import json
pid="$PID"
print(json.dumps({
  "items":[{"productId":pid,"qty":2,"unitPrice":0,"name":None,"category":None,"personalization":{}}],
  "customer":{"name":"Test","phone":"000","email":"test@example.com","notes":""},
  "shipping":{"addressLine1":"Test","addressLine2":"","city":"Test","stateRegion":"","postalCode":"","country":""},
  "paymentMethod":"card"
}, ensure_ascii=False))
PY
)")

if [[ "$HTTP_OOS" != "409" ]]; then
  echo "FAIL: expected 409 out_of_stock when qty exceeds inventory, got $HTTP_OOS" >&2
  exit 1
fi

# 2) Price tampering: send unitPrice=0 for qty 1; server must use PRICE
RESP=$(curl -sS -X POST "${API_URL%/}/checkout/place-order" \
  -H "Content-Type: application/json" \
  --data-binary "$(python3 - <<PY
import json
pid="$PID"
print(json.dumps({
  "items":[{"productId":pid,"qty":1,"unitPrice":0,"name":None,"category":None,"personalization":{}}],
  "customer":{"name":"Test","phone":"000","email":"test@example.com","notes":""},
  "shipping":{"addressLine1":"Test","addressLine2":"","city":"Test","stateRegion":"","postalCode":"","country":""},
  "paymentMethod":"card"
}, ensure_ascii=False))
PY
)")

UNIT=$(printf "%s" "$RESP" | python3 -c 'import sys,json; j=json.load(sys.stdin); it=(j.get("order") or {}).get("items") or []; print(float((it[0] or {}).get("unitPrice") or 0.0))')
TOTAL=$(printf "%s" "$RESP" | python3 -c 'import sys,json; j=json.load(sys.stdin); print(float((j.get("order") or {}).get("total") or 0.0))')

if python3 - <<PY
import sys
price=float("$PRICE")
unit=float("$UNIT")
if abs(unit-price) > 0.001:
    raise SystemExit(1)
PY
then :; else
  echo "FAIL: server did not enforce server-side unit price (expected $PRICE, got $UNIT)" >&2
  exit 1
fi

# Check total roughly matches price + taxes + shipping (using server rates)
python3 - <<PY
import sys
price=float("$PRICE")
tax_s=float("$TAX_S")
tax_m=float("$TAX_M")
ship=float("$SHIP")
expected=round(price + round(price*(tax_s/100.0),2) + round(price*(tax_m/100.0),2) + ship, 2)
total=float("$TOTAL")
if abs(total-expected) > 0.02:
    raise SystemExit(f"expected {expected}, got {total}")
PY

# 3) Activity log contains an order entry
ADMIN2=$(curl -sS "${API_URL%/}/state/admin" -H "Authorization: Bearer ${TOKEN}")
HAS_EVT=$(printf "%s" "$ADMIN2" | python3 -c 'import sys,json; j=json.load(sys.stdin); st=j.get("state") or {}; log=st.get("activityLog") or []; ok=False
for e in (log if isinstance(log,list) else []):
  if isinstance(e,dict) and e.get("kind")=="order":
    ok=True
    break
print("true" if ok else "false")')

if [[ "$HAS_EVT" != "true" ]]; then
  echo "FAIL: expected activityLog to include an order notification" >&2
  exit 1
fi

echo "OK: checkout hardening verified (server-side pricing, strict stock, activityLog notifications)."
