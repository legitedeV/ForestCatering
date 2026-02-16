#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

runlog="$(run_dir)"
log_file="${runlog}/headless-smoke.txt"
exec > >(tee -a "${log_file}") 2>&1

errors=0

db_cid="$(compose_cmd ps -q mariadb)"
db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
ws_key="$(awk -F= '/^PS_WEBSERVICE_KEY=/{print $2}' "${ENV_FILE}")"
admin_dir="$(awk -F= '/^PS_FOLDER_ADMIN=/{print $2}' "${ENV_FILE}")"
frontend_domain="$(awk -F= '/^FRONTEND_DOMAIN=/{print $2}' "${ENV_FILE}")"

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

pass() { echo "  ✔ $1"; }
fail() { echo "  ✘ $1" >&2; errors=$((errors + 1)); }

auth_b64="$(printf '%s' "${ws_key}:" | base64 | tr -d '\n')"
api_headers=(
  -H "Authorization: Basic ${auth_b64}"
)

echo "[1/8] API dostępne"
api_root_code="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/api/" "${api_headers[@]}" 2>/dev/null || echo "000")"
if [[ "${api_root_code}" == "200" ]]; then
  pass "GET /api/ -> HTTP 200"
else
  fail "GET /api/ -> HTTP ${api_root_code} (oczekiwano 200)"
fi

echo "[2/8] Produkty w API"
products_payload="${runlog}/products.xml"
curl -sS "http://127.0.0.1:8080/api/products" "${api_headers[@]}" > "${products_payload}" 2>/dev/null || true
products_count="$( (grep -o '<product id=' "${products_payload}" || true) | wc -l | tr -d ' ')"
if [[ "${products_count}" -ge 2 ]]; then
  pass "Liczba produktów w API: ${products_count}"
else
  fail "Za mało produktów w API: ${products_count} (oczekiwano >=2)"
fi

echo "[3/8] Kategorie Menu i Eventy w API"
categories_payload="${runlog}/categories.xml"
curl -sS "http://127.0.0.1:8080/api/categories?display=full" "${api_headers[@]}" > "${categories_payload}" 2>/dev/null || true
if grep -q 'Menu' "${categories_payload}" && grep -q 'Eventy' "${categories_payload}"; then
  pass "Kategorie Menu i Eventy obecne"
else
  fail "Brak kategorii Menu/Eventy w /api/categories"
fi

echo "[4/8] Feature business_type"
features_payload="${runlog}/product_features.xml"
curl -sS "http://127.0.0.1:8080/api/product_features?display=full" "${api_headers[@]}" > "${features_payload}" 2>/dev/null || true
if grep -q 'Typ biznesowy' "${features_payload}" || grep -q 'business_type' "${features_payload}"; then
  pass "Feature business_type/Typ biznesowy istnieje"
else
  fail "Brak feature business_type w /api/product_features"
fi

echo "[5/8] Customization fields produktu eventowego"
event_customizations="$(run_sql "SELECT COUNT(*)
  FROM ps_customization_field cf
  JOIN ps_product_lang pl ON pl.id_product=cf.id_product
  WHERE pl.name='Bankiet premium – 4h' AND cf.is_deleted=0;")"
if [[ "${event_customizations}" -ge 5 ]]; then
  pass "Produkt eventowy ma pola personalizacji (${event_customizations})"
else
  fail "Produkt eventowy nie ma wymaganych pól personalizacji (jest: ${event_customizations})"
fi

echo "[6/8] Przekierowanie frontu"
front_headers="${runlog}/front-headers.txt"
front_code="$(curl -sS -D "${front_headers}" -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/" 2>/dev/null || echo "000")"
location="$(awk 'tolower($1)=="location:" {print $2}' "${front_headers}" | tr -d '\r' | tail -n1)"
if [[ "${front_code}" == "301" && "${location}" =~ ^${frontend_domain} ]]; then
  pass "Front -> 301 do ${frontend_domain}"
else
  fail "Front redirect niepoprawny (HTTP ${front_code}, Location: ${location:-brak})"
fi

echo "[7/8] Admin dostępny"
admin_code="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/${admin_dir}/" 2>/dev/null || echo "000")"
if [[ "${admin_code}" =~ ^(200|302)$ ]]; then
  pass "Admin dostępny (HTTP ${admin_code})"
else
  fail "Admin niedostępny (HTTP ${admin_code})"
fi

echo "[8/8] Nagłówki CORS"
cors_headers="${runlog}/cors-headers.txt"
curl -sS -D "${cors_headers}" -o /dev/null "http://127.0.0.1:8080/api/" "${api_headers[@]}" 2>/dev/null || true
if tr -d '\r' < "${cors_headers}" | grep -qi "^Access-Control-Allow-Origin: ${frontend_domain}$"; then
  pass "Access-Control-Allow-Origin ustawiony"
else
  fail "Brak nagłówka Access-Control-Allow-Origin=${frontend_domain}"
fi

echo ""
if [[ "${errors}" -eq 0 ]]; then
  echo "Smoke headless: PASSED"
  echo "Log: ${log_file}"
  exit 0
fi

echo "Smoke headless: FAILED (${errors} błędów)"
echo "Log: ${log_file}"
exit 1
