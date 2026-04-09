#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3001}"

AUTH="$BASE/api/auth"
ME="$BASE/api/me"
CATS="$BASE/api/categorias"
PRODS="$BASE/api/productos"
CLIENTS="$BASE/api/clientes"
SALES="$BASE/api/ventas"

curl_s() {
  curl -sS --max-time 8 "$@"
}

echo "=== Smoke tests TFM PYME Ventas API ==="
echo "BASE: $BASE"
echo

echo "[0] Verificar servidor"
if ! curl_s -o /dev/null -w "%{http_code}" "$BASE/api/health" | grep -qE "200|201"; then
  echo "ERROR: No se pudo contactar el servidor en $BASE (revisa que nodemon esté corriendo)"
  echo "Sugerencia: npx nodemon src/server.js"
  exit 1
fi
echo "OK: servidor responde"
echo

echo "[1] Health check"
curl_s "$BASE/api/health" | cat
echo -e "\n"

echo "[2] Login OK -> obtener TOKEN"
TOKEN="$(curl_s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pyme.com","password":"Admin123*"}' | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).token")"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: Token vacío"
  exit 1
fi
echo "TOKEN obtenido (primeros 30 chars): ${TOKEN:0:30}..."
echo

echo "[3] Acceso a /api/me con token"
curl_s "$ME" -H "Authorization: Bearer $TOKEN" | cat
echo -e "\n"

echo "[4] Acceso a /api/me SIN token -> debe fallar (401)"
HTTP_CODE="$(curl_s -o /dev/null -w "%{http_code}" "$ME" || true)"
echo "HTTP: $HTTP_CODE (esperado 401)"
echo

echo "[5] Crear categoría (admin)"
CAT_NAME="CatTest_$(date +%s)"
CAT_RES="$(curl_s -X POST "$CATS" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"$CAT_NAME\"}")"
echo "$CAT_RES" | cat
echo

CAT_ID="$(echo "$CAT_RES" | node -p "const s=require('fs').readFileSync(0,'utf8'); const j=JSON.parse(s); j.id_categoria || ''")"
if [[ -z "$CAT_ID" ]]; then
  echo "ERROR: no se obtuvo CAT_ID"
  exit 1
fi
echo "CAT_ID=$CAT_ID"
echo

echo "[6] Crear producto con CAT_ID"
PROD_NAME="ProdTest_$(date +%s)"
PROD_RES="$(curl_s -X POST "$PRODS" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"$PROD_NAME\",\"precio\":3.50,\"stock\":20,\"id_categoria\":$CAT_ID}")"
echo "$PROD_RES" | cat
echo

PROD_ID="$(echo "$PROD_RES" | node -p "const s=require('fs').readFileSync(0,'utf8'); const j=JSON.parse(s); j.id_producto || ''")"
if [[ -z "$PROD_ID" ]]; then
  echo "ERROR: no se obtuvo PROD_ID"
  exit 1
fi
echo "PROD_ID=$PROD_ID"
echo

echo "[7] Crear cliente"
CLI_RES="$(curl_s -X POST "$CLIENTS" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"ClienteTest_$(date +%s)\",\"documento\":\"00000000\",\"telefono\":\"600 000 000\",\"email\":\"cliente_test@demo.com\"}")"
echo "$CLI_RES" | cat
echo

CLI_ID="$(echo "$CLI_RES" | node -p "const s=require('fs').readFileSync(0,'utf8'); const j=JSON.parse(s); j.id_cliente || ''")"
if [[ -z "$CLI_ID" ]]; then
  echo "ERROR: no se obtuvo CLI_ID"
  exit 1
fi
echo "CLI_ID=$CLI_ID"
echo

echo "[8] Crear venta (2 unidades)"
SALE_RES="$(curl_s -X POST "$SALES" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id_cliente\":$CLI_ID,\"items\":[{\"id_producto\":$PROD_ID,\"cantidad\":2}]}")"
echo "$SALE_RES" | cat
echo

echo "[9] Verificar stock bajó (listado productos)"
curl_s "$PRODS" -H "Authorization: Bearer $TOKEN" | cat
echo -e "\n"

echo "[10] Venta con stock insuficiente (cantidad 9999) -> debe fallar"
HTTP_CODE="$(curl_s -o /dev/null -w "%{http_code}" -X POST "$SALES" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id_cliente\":$CLI_ID,\"items\":[{\"id_producto\":$PROD_ID,\"cantidad\":9999}]}" || true)"
echo "HTTP: $HTTP_CODE (esperado 400)"
echo

echo "=== OK: smoke tests completados ==="
