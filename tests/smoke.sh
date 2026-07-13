#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3001}"

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

AUTH="$BASE/api/auth"
ME="$BASE/api/me"
CATS="$BASE/api/categorias"
PRODS="$BASE/api/productos"
CLIENTS="$BASE/api/clientes"
SALES="$BASE/api/ventas"

SMOKE_ADMIN_EMAIL="${SMOKE_ADMIN_EMAIL:-}"
SMOKE_ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-}"

curl_s() {
  curl -sS --max-time 8 "$@"
}

extract_json_field() {
  local field="$1"

  node -e '
    const fs = require("fs");
    const field = process.argv[1];
    const raw = fs.readFileSync(0, "utf8");

    try {
      const json = JSON.parse(raw);
      const value = json[field];

      if (value === undefined || value === null) {
        process.exit(2);
      }

      process.stdout.write(String(value));
    } catch {
      process.exit(3);
    }
  ' "$field"
}

echo "=== Smoke tests TFM PYME Ventas API ==="
echo "BASE: $BASE"
echo

if [[ -z "$SMOKE_ADMIN_EMAIL" || -z "$SMOKE_ADMIN_PASSWORD" ]]; then
  echo "ERROR: SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD no están configurados"
  exit 1
fi

echo "[0] Verificar servidor"
HTTP_CODE="$(curl_s -o /dev/null -w "%{http_code}" "$BASE/api/health" || true)"

if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "201" ]]; then
  echo "ERROR: No se pudo contactar el servidor en $BASE"
  exit 1
fi

echo "OK: servidor responde"
echo

echo "[1] Health check"
curl_s "$BASE/api/health"
echo -e "\n"

echo "[2] Login OK -> obtener TOKEN"

LOGIN_PAYLOAD="$(
  node -e '
    process.stdout.write(JSON.stringify({
      email: process.env.SMOKE_ADMIN_EMAIL,
      password: process.env.SMOKE_ADMIN_PASSWORD
    }));
  '
)"

LOGIN_RES="$(
  curl_s -X POST "$AUTH/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_PAYLOAD"
)"

TOKEN="$(
  printf '%s' "$LOGIN_RES" \
  | extract_json_field token \
  || true
)"

if [[ -z "$TOKEN" || "$TOKEN" == "undefined" || "$TOKEN" == "null" ]]; then
  echo "ERROR: no se obtuvo un token válido"
  echo "Respuesta del login: $LOGIN_RES"
  exit 1
fi

echo "TOKEN obtenido correctamente"
echo

echo "[3] Acceso a /api/me con token"

ME_RES="$(
  curl_s "$ME" \
    -H "Authorization: Bearer $TOKEN"
)"

echo "$ME_RES"
echo

ME_HTTP="$(
  curl_s -o /dev/null -w "%{http_code}" "$ME" \
    -H "Authorization: Bearer $TOKEN" \
  || true
)"

if [[ "$ME_HTTP" != "200" ]]; then
  echo "ERROR: /api/me respondió HTTP $ME_HTTP"
  exit 1
fi

echo "[4] Acceso a /api/me SIN token -> debe fallar (401)"

HTTP_CODE="$(
  curl_s -o /dev/null -w "%{http_code}" "$ME" \
  || true
)"

echo "HTTP: $HTTP_CODE"

if [[ "$HTTP_CODE" != "401" ]]; then
  echo "ERROR: se esperaba HTTP 401"
  exit 1
fi

echo

echo "[5] Crear categoría (admin)"

CAT_NAME="CatTest_$(date +%s)"

CAT_RES="$(
  curl_s -X POST "$CATS" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"$CAT_NAME\"}"
)"

echo "$CAT_RES"
echo

CAT_ID="$(
  printf '%s' "$CAT_RES" \
  | extract_json_field id_categoria \
  || true
)"

if [[ -z "$CAT_ID" ]]; then
  echo "ERROR: no se obtuvo CAT_ID"
  exit 1
fi

echo "CAT_ID=$CAT_ID"
echo

echo "[6] Crear producto con CAT_ID"

PROD_NAME="ProdTest_$(date +%s)"

PROD_RES="$(
  curl_s -X POST "$PRODS" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"nombre\":\"$PROD_NAME\",
      \"precio\":3.50,
      \"stock\":20,
      \"id_categoria\":$CAT_ID
    }"
)"

echo "$PROD_RES"
echo

PROD_ID="$(
  printf '%s' "$PROD_RES" \
  | extract_json_field id_producto \
  || true
)"

if [[ -z "$PROD_ID" ]]; then
  echo "ERROR: no se obtuvo PROD_ID"
  exit 1
fi

echo "PROD_ID=$PROD_ID"
echo

echo "[7] Crear cliente"

UNIQUE_SUFFIX="$(date +%s)"
DOCUMENT_NUMBER="$((UNIQUE_SUFFIX % 100000000))"
DOCUMENTO="$(printf 'U%08d' "$DOCUMENT_NUMBER")"

CLI_RES="$(
  curl_s -X POST "$CLIENTS" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"nombre\":\"Cliente Prueba\",
      \"documento\":\"$DOCUMENTO\",
      \"telefono\":\"600000000\",
      \"email\":\"cliente.$UNIQUE_SUFFIX@demo.test\"
    }"
)"

echo "$CLI_RES"
echo

CLI_ID="$(
  printf '%s' "$CLI_RES" \
  | extract_json_field id_cliente \
  || true
)"

if [[ -z "$CLI_ID" ]]; then
  echo "ERROR: no se obtuvo CLI_ID"
  exit 1
fi

echo "CLI_ID=$CLI_ID"
echo

echo "[8] Crear venta (2 unidades)"

SALE_RES="$(
  curl_s -X POST "$SALES" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"id_cliente\":$CLI_ID,
      \"items\":[
        {
          \"id_producto\":$PROD_ID,
          \"cantidad\":2
        }
      ]
    }"
)"

echo "$SALE_RES"
echo

SALE_ID="$(
  printf '%s' "$SALE_RES" \
  | extract_json_field id_venta \
  || true
)"

if [[ -z "$SALE_ID" ]]; then
  echo "ERROR: no se obtuvo SALE_ID"
  exit 1
fi

echo "SALE_ID=$SALE_ID"
echo

echo "[9] Verificar stock bajó"

PRODUCTS_RES="$(
  curl_s "$PRODS" \
    -H "Authorization: Bearer $TOKEN"
)"

echo "$PRODUCTS_RES"
echo

echo "[10] Venta con stock insuficiente -> debe fallar"

HTTP_CODE="$(
  curl_s -o /dev/null -w "%{http_code}" \
    -X POST "$SALES" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"id_cliente\":$CLI_ID,
      \"items\":[
        {
          \"id_producto\":$PROD_ID,
          \"cantidad\":9999
        }
      ]
    }" \
  || true
)"

echo "HTTP: $HTTP_CODE"

if [[ "$HTTP_CODE" != "400" && "$HTTP_CODE" != "409" ]]; then
  echo "ERROR: se esperaba HTTP 400 o 409"
  exit 1
fi

echo
echo "=== OK: smoke tests completados ==="
