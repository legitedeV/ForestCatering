#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
# smoke-headless.sh
# Validates the headless PrestaShop backend configuration:
#   1. API responds with JSON to authenticated requests
#   2. API key has proper permissions
#   3. business_type feature exists in DB
#   4. Category structure exists (Menu + Eventy)
#   5. Admin panel is accessible
#   6. Webservice is enabled in configuration
#
# Usage:  ./infra/scripts/smoke-headless.sh
# ────────────────────────────────────────────────────────────
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

runlog="$(run_dir)"
errors=0

db_cid="$(compose_cmd ps -q mariadb)"
ps_cid="$(compose_cmd ps -q prestashop)"
db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
ws_key="$(awk -F= '/^PS_WEBSERVICE_KEY=/{print $2}' "${ENV_FILE}")"
admin_dir="$(awk -F= '/^PS_FOLDER_ADMIN=/{print $2}' "${ENV_FILE}")"

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

pass() { echo "  ✔ $1"; }
fail() { echo "  ✘ $1" >&2; errors=$((errors + 1)); }

# ── 1. Webservice enabled ──
echo "[1/6] Webservice aktywny"
ws_on="$(run_sql "SELECT value FROM ps_configuration WHERE name='PS_WEBSERVICE' LIMIT 1;")"
if [[ "${ws_on}" == "1" ]]; then pass "PS_WEBSERVICE=1"; else fail "PS_WEBSERVICE != 1 (got: ${ws_on})"; fi

# ── 2. API key exists and is active ──
echo "[2/6] Klucz API"
key_active="$(run_sql "SELECT active FROM ps_webservice_account WHERE key_value='${ws_key}' LIMIT 1;")"
if [[ "${key_active}" == "1" ]]; then pass "Klucz aktywny"; else fail "Klucz nieaktywny lub nie istnieje"; fi

perm_count="$(run_sql "SELECT COUNT(DISTINCT resource) FROM ps_webservice_permission wp
  JOIN ps_webservice_account wa ON wa.id_webservice_account = wp.id_webservice_account
  WHERE wa.key_value='${ws_key}';")"
if [[ "${perm_count}" -ge 10 ]]; then pass "Uprawnienia: ${perm_count} zasobów"; else fail "Za mało uprawnień: ${perm_count}"; fi

# ── 3. API responds with JSON ──
echo "[3/6] API HTTP response"
api_code="$(curl -sS -o "${runlog}/api-products.json" -w '%{http_code}' \
  -u "${ws_key}:" "http://127.0.0.1:8080/api/products?output_format=JSON" 2>/dev/null || echo "000")"
if [[ "${api_code}" == "200" ]]; then
  pass "GET /api/products -> HTTP ${api_code}"
  # Verify it's JSON
  if head -c 1 "${runlog}/api-products.json" | grep -q '{'; then
    pass "Odpowiedź to JSON"
  else
    fail "Odpowiedź nie jest JSON"
  fi
else
  fail "GET /api/products -> HTTP ${api_code} (oczekiwano 200)"
fi

# ── 4. business_type feature ──
echo "[4/6] Feature: business_type"
bt_feature="$(run_sql "SELECT COUNT(*) FROM ps_feature_lang WHERE name='business_type';")"
if [[ "${bt_feature}" -ge 1 ]]; then pass "Feature business_type istnieje"; else fail "Brak feature business_type"; fi

bt_retail="$(run_sql "SELECT COUNT(*) FROM ps_feature_value_lang fvl
  JOIN ps_feature_value fv ON fv.id_feature_value = fvl.id_feature_value
  JOIN ps_feature_lang fl ON fl.id_feature = fv.id_feature AND fl.name='business_type'
  WHERE fvl.value='retail';")"
bt_event="$(run_sql "SELECT COUNT(*) FROM ps_feature_value_lang fvl
  JOIN ps_feature_value fv ON fv.id_feature_value = fvl.id_feature_value
  JOIN ps_feature_lang fl ON fl.id_feature = fv.id_feature AND fl.name='business_type'
  WHERE fvl.value='event';")"
if [[ "${bt_retail}" -ge 1 ]]; then pass "Wartość: retail"; else fail "Brak wartości: retail"; fi
if [[ "${bt_event}" -ge 1 ]]; then pass "Wartość: event"; else fail "Brak wartości: event"; fi

# ── 5. Category structure ──
echo "[5/6] Kategorie"
for cat_name in "Menu" "Eventy" "Lunch boxy" "Kanapki" "Sałatki" "Napoje" \
  "Lunch biznesowy" "Bankiet premium" "Regeneracyjne" "ForestBar"; do
  cnt="$(run_sql "SELECT COUNT(*) FROM ps_category_lang WHERE name='${cat_name}';")"
  if [[ "${cnt}" -ge 1 ]]; then pass "Kategoria: ${cat_name}"; else fail "Brak kategorii: ${cat_name}"; fi
done

# ── 6. Admin accessible ──
echo "[6/6] Panel admin"
admin_code="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/${admin_dir}/" 2>/dev/null || echo "000")"
if [[ "${admin_code}" =~ ^(200|302|301)$ ]]; then
  pass "Admin panel: HTTP ${admin_code}"
else
  fail "Admin panel: HTTP ${admin_code} (oczekiwano 200/301/302)"
fi

# ── Summary ──
echo ""
if [[ "${errors}" -eq 0 ]]; then
  echo "════════════════════════════════════"
  echo "  Smoke headless: PASSED ✔"
  echo "════════════════════════════════════"
else
  echo "════════════════════════════════════"
  echo "  Smoke headless: FAILED (${errors} błędów) ✘"
  echo "════════════════════════════════════"
  exit 1
fi

echo "Logi: ${runlog}"
