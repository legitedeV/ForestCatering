#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
# headless-setup.sh
# Configure PrestaShop 9 as a headless backend:
#   1. Enable Webservice API & create API key
#   2. Create business_type feature (retail / event)
#   3. Create category tree (Menu + Eventy)
#   4. Prepare customization-field definitions for event products
#   5. Disable front-office rendering (CORS, webservice settings)
#
# Usage:  ./infra/scripts/headless-setup.sh
# Requires: running compose stack (mariadb + prestashop)
# ────────────────────────────────────────────────────────────
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

compose_cmd up -d mariadb redis prestashop >/dev/null

ps_cid="$(compose_cmd ps -q prestashop)"
db_cid="$(compose_cmd ps -q mariadb)"
if [[ -z "${ps_cid}" || -z "${db_cid}" ]]; then
  echo "Kontenery prestashop/mariadb nie są dostępne." >&2
  exit 1
fi

db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
ws_key="$(awk -F= '/^PS_WEBSERVICE_KEY=/{print $2}' "${ENV_FILE}")"
frontend_domain="$(awk -F= '/^FRONTEND_DOMAIN=/{print $2}' "${ENV_FILE}")"

if [[ -z "${ws_key}" ]]; then
  echo "PS_WEBSERVICE_KEY jest pusty w .env. Wygeneruj klucz (np. openssl rand -hex 16)." >&2
  exit 1
fi

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

# Wait for DB tables to exist (PrestaShop auto-install may still run)
for _ in {1..60}; do
  if [[ -n "$(run_sql "SHOW TABLES LIKE 'ps_configuration';" 2>/dev/null)" ]]; then break; fi
  sleep 3
done

pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang WHERE iso_code='pl' LIMIT 1;")"
if [[ -z "${pl_lang_id}" ]]; then
  pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang ORDER BY id_lang ASC LIMIT 1;")"
fi
echo "Język domyślny: id_lang=${pl_lang_id}"

# ────────────────────────────────────────────────────────────
# 1. ENABLE WEBSERVICE & CREATE API KEY
# ────────────────────────────────────────────────────────────
echo "── 1/5 Konfiguracja Webservice API ──"

# Enable webservice
run_sql "UPDATE ps_configuration SET value='1' WHERE name='PS_WEBSERVICE';"
run_sql "INSERT IGNORE INTO ps_configuration (name, value, date_add, date_upd) \
  VALUES ('PS_WEBSERVICE', '1', NOW(), NOW());"

# Insert API key if not present
existing_key="$(run_sql "SELECT id_webservice_account FROM ps_webservice_account WHERE key_value='${ws_key}' LIMIT 1;" 2>/dev/null || true)"
if [[ -z "${existing_key}" ]]; then
  run_sql "INSERT INTO ps_webservice_account (key_value, active, description, class_name, is_module, module_name)
    VALUES ('${ws_key}', 1, 'Headless API (Next.js frontend)', '', 0, '');"
  existing_key="$(run_sql "SELECT id_webservice_account FROM ps_webservice_account WHERE key_value='${ws_key}' LIMIT 1;")"
  echo "  Utworzono klucz API: id=${existing_key}"
else
  run_sql "UPDATE ps_webservice_account SET active=1 WHERE key_value='${ws_key}';"
  echo "  Klucz API istnieje: id=${existing_key}"
fi

# Define resources to grant full CRUD access
resources=(
  products categories combinations customers carts orders order_details
  stock_availables carriers addresses countries specific_prices
  product_features product_feature_values product_customization_fields
  customizations images manufacturers suppliers taxes
)

for res in "${resources[@]}"; do
  for method in GET POST PUT DELETE HEAD; do
    run_sql "INSERT IGNORE INTO ps_webservice_permission (id_webservice_account, resource, method)
      VALUES (${existing_key}, '${res}', '${method}');" 2>/dev/null || true
  done
done
echo "  Przyznano uprawnienia do ${#resources[@]} zasobów (GET/POST/PUT/DELETE/HEAD)."

# ────────────────────────────────────────────────────────────
# 2. CREATE FEATURE: business_type (retail / event)
# ────────────────────────────────────────────────────────────
echo "── 2/5 Feature: business_type ──"

feature_id="$(run_sql "SELECT fl.id_feature FROM ps_feature_lang fl
  WHERE fl.name='business_type' AND fl.id_lang=${pl_lang_id} LIMIT 1;" 2>/dev/null || true)"

if [[ -z "${feature_id}" ]]; then
  # Determine next position
  max_pos="$(run_sql "SELECT COALESCE(MAX(position),0) FROM ps_feature;")"
  next_pos=$((max_pos + 1))
  run_sql "INSERT INTO ps_feature (position) VALUES (${next_pos});"
  feature_id="$(run_sql "SELECT LAST_INSERT_ID();")"
  # Insert lang rows for all languages
  lang_ids="$(run_sql "SELECT id_lang FROM ps_lang;")"
  while IFS= read -r lid; do
    [[ -z "${lid}" ]] && continue
    run_sql "INSERT IGNORE INTO ps_feature_lang (id_feature, id_lang, name) VALUES (${feature_id}, ${lid}, 'business_type');"
  done <<< "${lang_ids}"
  # Associate with all shops
  run_sql "INSERT IGNORE INTO ps_feature_shop (id_feature, id_shop) SELECT ${feature_id}, id_shop FROM ps_shop;"
  echo "  Utworzono feature: id_feature=${feature_id}"
else
  echo "  Feature istnieje: id_feature=${feature_id}"
fi

# Create feature values: retail, event
for fv_name in retail event; do
  fv_id="$(run_sql "SELECT fvl.id_feature_value FROM ps_feature_value_lang fvl
    JOIN ps_feature_value fv ON fv.id_feature_value = fvl.id_feature_value
    WHERE fv.id_feature=${feature_id} AND fvl.value='${fv_name}' AND fvl.id_lang=${pl_lang_id} LIMIT 1;" 2>/dev/null || true)"
  if [[ -z "${fv_id}" ]]; then
    run_sql "INSERT INTO ps_feature_value (id_feature, custom) VALUES (${feature_id}, 0);"
    fv_id="$(run_sql "SELECT LAST_INSERT_ID();")"
    lang_ids="$(run_sql "SELECT id_lang FROM ps_lang;")"
    while IFS= read -r lid; do
      [[ -z "${lid}" ]] && continue
      run_sql "INSERT IGNORE INTO ps_feature_value_lang (id_feature_value, id_lang, value) VALUES (${fv_id}, ${lid}, '${fv_name}');"
    done <<< "${lang_ids}"
    echo "  Utworzono wartość: ${fv_name} (id_feature_value=${fv_id})"
  else
    echo "  Wartość istnieje: ${fv_name} (id_feature_value=${fv_id})"
  fi
done

# ────────────────────────────────────────────────────────────
# 3. CREATE CATEGORY STRUCTURE
# ────────────────────────────────────────────────────────────
echo "── 3/5 Struktura kategorii ──"

root_cat="$(run_sql "SELECT id_category FROM ps_category WHERE is_root_category=1 ORDER BY id_category ASC LIMIT 1;")"
home_cat="$(run_sql "SELECT id_category FROM ps_category WHERE id_parent=${root_cat} AND level_depth=1 ORDER BY id_category ASC LIMIT 1;")"
if [[ -z "${home_cat}" ]]; then
  home_cat="${root_cat}"
fi

insert_category() {
  local parent_id="$1"
  local cat_name="$2"
  local link_rewrite="$3"

  # Check if exists
  local cat_id
  cat_id="$(run_sql "SELECT cl.id_category FROM ps_category_lang cl
    JOIN ps_category c ON c.id_category = cl.id_category
    WHERE cl.name='${cat_name}' AND c.id_parent=${parent_id} AND cl.id_lang=${pl_lang_id} LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${cat_id}" ]]; then
    local parent_depth
    parent_depth="$(run_sql "SELECT level_depth FROM ps_category WHERE id_category=${parent_id};")"
    local depth=$((parent_depth + 1))
    local max_pos
    max_pos="$(run_sql "SELECT COALESCE(MAX(position),0) FROM ps_category WHERE id_parent=${parent_id};")"
    local pos=$((max_pos + 1))

    # Get nleft/nright boundaries
    local parent_nright
    parent_nright="$(run_sql "SELECT nright FROM ps_category WHERE id_category=${parent_id};")"
    # Shift existing nodes
    run_sql "UPDATE ps_category SET nright = nright + 2 WHERE nright >= ${parent_nright};"
    run_sql "UPDATE ps_category SET nleft = nleft + 2 WHERE nleft > ${parent_nright};"

    run_sql "INSERT INTO ps_category (id_parent, level_depth, active, position, nleft, nright, date_add, date_upd)
      VALUES (${parent_id}, ${depth}, 1, ${pos}, ${parent_nright}, $((parent_nright + 1)), NOW(), NOW());"
    cat_id="$(run_sql "SELECT LAST_INSERT_ID();")"

    lang_ids="$(run_sql "SELECT id_lang FROM ps_lang;")"
    while IFS= read -r lid; do
      [[ -z "${lid}" ]] && continue
      run_sql "INSERT IGNORE INTO ps_category_lang (id_category, id_shop, id_lang, name, link_rewrite)
        SELECT ${cat_id}, id_shop, ${lid}, '${cat_name}', '${link_rewrite}' FROM ps_shop;"
    done <<< "${lang_ids}"

    run_sql "INSERT IGNORE INTO ps_category_shop (id_category, id_shop, position) SELECT ${cat_id}, id_shop, ${pos} FROM ps_shop;"
    # Insert into category_group for default groups (visitor=1, guest=2, customer=3)
    for gid in 1 2 3; do
      run_sql "INSERT IGNORE INTO ps_category_group (id_category, id_group) VALUES (${cat_id}, ${gid});" 2>/dev/null || true
    done
    echo "  Utworzono kategorię: ${cat_name} (id=${cat_id}, parent=${parent_id})"
  else
    echo "  Kategoria istnieje: ${cat_name} (id=${cat_id})"
  fi
  printf '%s' "${cat_id}"
}

# Top-level: Menu, Eventy
menu_id="$(insert_category "${home_cat}" "Menu" "menu")"
eventy_id="$(insert_category "${home_cat}" "Eventy" "eventy")"

# Menu subcategories
insert_category "${menu_id}" "Lunch boxy" "lunch-boxy" >/dev/null
insert_category "${menu_id}" "Kanapki" "kanapki" >/dev/null
insert_category "${menu_id}" "Sałatki" "salatki" >/dev/null
insert_category "${menu_id}" "Napoje" "napoje" >/dev/null

# Eventy subcategories
insert_category "${eventy_id}" "Lunch biznesowy" "lunch-biznesowy" >/dev/null
insert_category "${eventy_id}" "Bankiet premium" "bankiet-premium" >/dev/null
insert_category "${eventy_id}" "Regeneracyjne" "regeneracyjne" >/dev/null
insert_category "${eventy_id}" "ForestBar" "forestbar" >/dev/null

# ────────────────────────────────────────────────────────────
# 4. PREPARE CUSTOMIZATION FIELDS DEFINITION (for event products)
# ────────────────────────────────────────────────────────────
echo "── 4/5 Definicja pól personalizacji event ──"

# The customization fields are per-product in PrestaShop.
# We store a helper SQL template that can be applied to any event product.
# This section creates a reference (documentation) entry and provides
# the SQL pattern operators can use after creating an event product.

cat <<'CUSTINFO'
  Pola personalizacji dla produktów EVENT (dodawane per-produkt):
  ┌───────────────────────┬──────┬──────────┐
  │ Pole                  │ Typ  │ Wymagane  │
  ├───────────────────────┼──────┼──────────┤
  │ Liczba osób           │ text │ TAK       │
  │ Data wydarzenia       │ text │ TAK       │
  │ Godzina wydarzenia    │ text │ TAK       │
  │ Adres realizacji      │ text │ TAK       │
  │ Dodatkowe uwagi       │ text │ NIE       │
  └───────────────────────┴──────┴──────────┘
  Użyj: ./infra/scripts/headless-add-event-product.sh <id_product>
CUSTINFO

# ────────────────────────────────────────────────────────────
# 5. CONFIGURE HEADLESS SETTINGS (CORS, disable front rendering)
# ────────────────────────────────────────────────────────────
echo "── 5/5 Ustawienia headless ──"

# Set CORS allowed origins for the frontend domain
if [[ -n "${frontend_domain}" ]]; then
  run_sql "DELETE FROM ps_configuration WHERE name='PS_WEBSERVICE_CORS_ORIGIN';"
  run_sql "INSERT INTO ps_configuration (name, value, date_add, date_upd) VALUES ('PS_WEBSERVICE_CORS_ORIGIN', '${frontend_domain}', NOW(), NOW());"
  echo "  CORS: ${frontend_domain}"
fi

# Ensure webservice CGI is not disabled
run_sql "INSERT IGNORE INTO ps_configuration (name, value, date_add, date_upd) VALUES ('PS_WEBSERVICE_CGI_HOST', '1', NOW(), NOW());"

# Clear cache
if docker exec "${ps_cid}" test -f /var/www/html/bin/console; then
  docker exec "${ps_cid}" php /var/www/html/bin/console cache:clear --no-warmup --env=prod >/dev/null 2>&1 || true
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "  Headless backend skonfigurowany!"
echo ""
echo "  API endpoint : http://${frontend_domain:-localhost}:8080/api/"
echo "  Klucz API    : ${ws_key}"
echo "  Feature      : business_type (retail / event)"
echo "  Kategorie    : Menu (retail) + Eventy (event)"
echo ""
echo "  Test API:  curl -s -u '${ws_key}:' http://127.0.0.1:8080/api/products?output_format=JSON"
echo "════════════════════════════════════════════════════"
