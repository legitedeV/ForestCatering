#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

compose_cmd up -d mariadb prestashop >/dev/null

db_cid="$(compose_cmd ps -q mariadb)"
db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"

if [[ -z "${db_cid}" ]]; then
  echo "Kontener mariadb nie jest dostępny." >&2
  exit 1
fi

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

for _ in {1..60}; do
  if [[ -n "$(run_sql "SHOW TABLES LIKE 'ps_product';" 2>/dev/null)" ]]; then
    break
  fi
  sleep 3
done

pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang WHERE iso_code='pl' LIMIT 1;")"
if [[ -z "${pl_lang_id}" ]]; then
  pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang ORDER BY id_lang ASC LIMIT 1;")"
fi

find_or_create_feature() {
  local feature_name="$1"
  local escaped_name
  escaped_name="$(sql_escape "${feature_name}")"
  local feature_id
  feature_id="$(run_sql "SELECT fl.id_feature FROM ps_feature_lang fl WHERE fl.name='${escaped_name}' AND fl.id_lang=${pl_lang_id} LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${feature_id}" ]]; then
    local max_position
    max_position="$(run_sql "SELECT COALESCE(MAX(position), 0) + 1 FROM ps_feature;")"
    run_sql "INSERT INTO ps_feature (position) VALUES (${max_position});"
    feature_id="$(run_sql "SELECT LAST_INSERT_ID();")"
    run_sql "INSERT IGNORE INTO ps_feature_lang (id_feature, id_lang, name)
      SELECT ${feature_id}, id_lang, '${escaped_name}' FROM ps_lang;"
    run_sql "INSERT IGNORE INTO ps_feature_shop (id_feature, id_shop)
      SELECT ${feature_id}, id_shop FROM ps_shop;"
    echo "  Utworzono feature: ${feature_name} (id=${feature_id})" >&2
  else
    echo "  Feature istnieje: ${feature_name} (id=${feature_id})" >&2
  fi

  printf '%s' "${feature_id}"
}

find_or_create_feature_value() {
  local feature_id="$1"
  local value_name="$2"
  local escaped_value
  escaped_value="$(sql_escape "${value_name}")"
  local fv_id
  fv_id="$(run_sql "SELECT fv.id_feature_value
    FROM ps_feature_value fv
    JOIN ps_feature_value_lang fvl ON fvl.id_feature_value=fv.id_feature_value
    WHERE fv.id_feature=${feature_id} AND fvl.id_lang=${pl_lang_id} AND fvl.value='${escaped_value}'
    LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${fv_id}" ]]; then
    run_sql "INSERT INTO ps_feature_value (id_feature, custom) VALUES (${feature_id}, 0);"
    fv_id="$(run_sql "SELECT LAST_INSERT_ID();")"
    run_sql "INSERT IGNORE INTO ps_feature_value_lang (id_feature_value, id_lang, value)
      SELECT ${fv_id}, id_lang, '${escaped_value}' FROM ps_lang;"
    echo "  Dodano wartość feature: ${value_name} (id=${fv_id})" >&2
  else
    echo "  Wartość feature istnieje: ${value_name} (id=${fv_id})" >&2
  fi

  printf '%s' "${fv_id}"
}

insert_category() {
  local parent_id="$1"
  local cat_name="$2"
  local slug="$3"

  local e_name e_slug cat_id
  e_name="$(sql_escape "${cat_name}")"
  e_slug="$(sql_escape "${slug}")"

  cat_id="$(run_sql "SELECT cl.id_category FROM ps_category_lang cl
    JOIN ps_category c ON c.id_category = cl.id_category
    WHERE c.id_parent=${parent_id} AND cl.id_lang=${pl_lang_id} AND cl.name='${e_name}'
    LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${cat_id}" ]]; then
    local depth pos parent_nright
    depth="$(( $(run_sql "SELECT level_depth FROM ps_category WHERE id_category=${parent_id};") + 1 ))"
    pos="$(( $(run_sql "SELECT COALESCE(MAX(position), 0) FROM ps_category WHERE id_parent=${parent_id};") + 1 ))"
    parent_nright="$(run_sql "SELECT nright FROM ps_category WHERE id_category=${parent_id};")"

    run_sql "UPDATE ps_category SET nright=nright+2 WHERE nright >= ${parent_nright};"
    run_sql "UPDATE ps_category SET nleft=nleft+2 WHERE nleft > ${parent_nright};"
    run_sql "INSERT INTO ps_category (id_parent, level_depth, active, position, nleft, nright, date_add, date_upd)
      VALUES (${parent_id}, ${depth}, 1, ${pos}, ${parent_nright}, $((parent_nright + 1)), NOW(), NOW());"
    cat_id="$(run_sql "SELECT LAST_INSERT_ID();")"

    run_sql "INSERT IGNORE INTO ps_category_lang (id_category, id_shop, id_lang, name, link_rewrite)
      SELECT ${cat_id}, s.id_shop, l.id_lang, '${e_name}', '${e_slug}'
      FROM ps_shop s CROSS JOIN ps_lang l;"
    run_sql "INSERT IGNORE INTO ps_category_shop (id_category, id_shop, position)
      SELECT ${cat_id}, id_shop, ${pos} FROM ps_shop;"
    run_sql "INSERT IGNORE INTO ps_category_group (id_category, id_group) VALUES (${cat_id},1),(${cat_id},2),(${cat_id},3);"
    echo "  Dodano kategorię: ${cat_name} (id=${cat_id})" >&2
  else
    echo "  Kategoria istnieje: ${cat_name} (id=${cat_id})" >&2
  fi

  printf '%s' "${cat_id}"
}

assign_feature_to_product() {
  local product_id="$1"
  local feature_id="$2"
  local feature_value_id="$3"
  run_sql "DELETE FROM ps_feature_product WHERE id_product=${product_id} AND id_feature=${feature_id};"
  run_sql "INSERT INTO ps_feature_product (id_feature, id_product, id_feature_value)
    VALUES (${feature_id}, ${product_id}, ${feature_value_id});"
}

find_tax_group_by_rate() {
  local rate="$1"
  run_sql "SELECT tr.id_tax_rules_group
    FROM ps_tax_rule tr
    JOIN ps_tax t ON t.id_tax=tr.id_tax
    WHERE ABS(t.rate - ${rate}) < 0.001
    ORDER BY tr.id_tax_rules_group
    LIMIT 1;" 2>/dev/null || true
}

upsert_product() {
  local name="$1"
  local slug="$2"
  local category_id="$3"
  local price="$4"
  local tax_group="$5"
  local minimal_qty="$6"
  local stock_qty="$7"
  local out_of_stock="$8"

  local e_name e_slug product_id
  e_name="$(sql_escape "${name}")"
  e_slug="$(sql_escape "${slug}")"

  product_id="$(run_sql "SELECT id_product FROM ps_product_lang WHERE id_lang=${pl_lang_id} AND name='${e_name}' ORDER BY id_product DESC LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${product_id}" ]]; then
    run_sql "INSERT INTO ps_product (id_tax_rules_group, price, active, minimal_quantity, state, date_add, date_upd)
      VALUES (${tax_group}, ${price}, 1, ${minimal_qty}, 1, NOW(), NOW());"
    product_id="$(run_sql "SELECT LAST_INSERT_ID();")"
    run_sql "INSERT INTO ps_product_shop
      (id_product, id_shop, id_category_default, id_tax_rules_group, active, price, minimal_quantity, available_for_order, show_price, out_of_stock, date_add, date_upd)
      SELECT ${product_id}, id_shop, ${category_id}, ${tax_group}, 1, ${price}, ${minimal_qty}, 1, 1, ${out_of_stock}, NOW(), NOW() FROM ps_shop;"
    run_sql "INSERT IGNORE INTO ps_product_lang
      (id_product, id_shop, id_lang, name, link_rewrite, description, description_short, available_now)
      SELECT ${product_id}, s.id_shop, l.id_lang, '${e_name}', '${e_slug}', '', '', ''
      FROM ps_shop s CROSS JOIN ps_lang l;"
    echo "  Dodano produkt: ${name} (id=${product_id})" >&2
  else
    run_sql "UPDATE ps_product SET id_tax_rules_group=${tax_group}, price=${price}, active=1, minimal_quantity=${minimal_qty}, date_upd=NOW() WHERE id_product=${product_id};"
    run_sql "UPDATE ps_product_shop SET id_category_default=${category_id}, id_tax_rules_group=${tax_group}, price=${price}, active=1, minimal_quantity=${minimal_qty}, available_for_order=1, show_price=1, out_of_stock=${out_of_stock}, date_upd=NOW() WHERE id_product=${product_id};"
    echo "  Produkt istnieje: ${name} (id=${product_id})" >&2
  fi

  run_sql "INSERT IGNORE INTO ps_category_product (id_category, id_product, position)
    VALUES (${category_id}, ${product_id}, (SELECT COALESCE(MAX(cp.position), 0) + 1 FROM ps_category_product cp WHERE cp.id_category=${category_id}));"

  run_sql "INSERT INTO ps_stock_available
    (id_product, id_product_attribute, id_shop, id_shop_group, quantity, depends_on_stock, out_of_stock, location)
    SELECT ${product_id}, 0, s.id_shop, s.id_shop_group, ${stock_qty}, 0, ${out_of_stock}, '' FROM ps_shop s
    ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), depends_on_stock=0, out_of_stock=VALUES(out_of_stock);"

  printf '%s' "${product_id}"
}

add_event_customization_fields() {
  local product_id="$1"
  local fields=(
    "Liczba osób:1"
    "Data wydarzenia:1"
    "Godzina wydarzenia:1"
    "Adres realizacji:1"
    "Dodatkowe uwagi:0"
  )

  run_sql "UPDATE ps_product SET customizable=1 WHERE id_product=${product_id};"
  run_sql "UPDATE ps_product_shop SET customizable=1 WHERE id_product=${product_id};"

  for field_def in "${fields[@]}"; do
    IFS=':' read -r field_name required <<< "${field_def}"
    local e_field existing cf_id
    e_field="$(sql_escape "${field_name}")"
    existing="$(run_sql "SELECT cf.id_customization_field FROM ps_customization_field cf
      JOIN ps_customization_field_lang cfl ON cfl.id_customization_field=cf.id_customization_field
      WHERE cf.id_product=${product_id} AND cfl.id_lang=${pl_lang_id} AND cfl.name='${e_field}'
      LIMIT 1;" 2>/dev/null || true)"

    if [[ -z "${existing}" ]]; then
      run_sql "INSERT INTO ps_customization_field (id_product, type, required, is_module, is_deleted)
        VALUES (${product_id}, 1, ${required}, 0, 0);"
      cf_id="$(run_sql "SELECT LAST_INSERT_ID();")"
      run_sql "INSERT IGNORE INTO ps_customization_field_lang (id_customization_field, id_lang, name)
        SELECT ${cf_id}, id_lang, '${e_field}' FROM ps_lang;"
      echo "  Dodano pole personalizacji: ${field_name}"
    fi
  done

  text_count="$(run_sql "SELECT COUNT(*) FROM ps_customization_field WHERE id_product=${product_id} AND type=1 AND is_deleted=0;")"
  run_sql "UPDATE ps_product SET text_fields=${text_count}, uploadable_files=0 WHERE id_product=${product_id};"
  run_sql "UPDATE ps_product_shop SET text_fields=${text_count}, uploadable_files=0 WHERE id_product=${product_id};"
}

echo "── 1/4 Feature business_type ──"
feature_id="$(find_or_create_feature "Typ biznesowy")"
fv_retail="$(find_or_create_feature_value "${feature_id}" "retail")"
fv_event="$(find_or_create_feature_value "${feature_id}" "event")"

echo "── 2/4 Kategorie ──"
root_category="$(run_sql "SELECT id_category FROM ps_category WHERE id_category=2 LIMIT 1;")"
if [[ -z "${root_category}" ]]; then
  root_category="$(run_sql "SELECT id_category FROM ps_category WHERE is_root_category=1 ORDER BY id_category ASC LIMIT 1;")"
fi
menu_id="$(insert_category "${root_category}" "Menu" "menu")"
kanapki_id="$(insert_category "${menu_id}" "Kanapki" "kanapki")"
insert_category "${menu_id}" "Lunch boxy" "lunch-boxy" >/dev/null
insert_category "${menu_id}" "Sałatki" "salatki" >/dev/null
insert_category "${menu_id}" "Napoje" "napoje" >/dev/null

eventy_id="$(insert_category "${root_category}" "Eventy" "eventy")"
bankiet_id="$(insert_category "${eventy_id}" "Bankiet premium" "bankiet-premium")"
insert_category "${eventy_id}" "Lunch biznesowy" "lunch-biznesowy" >/dev/null
insert_category "${eventy_id}" "Regeneracyjne" "regeneracyjne" >/dev/null
insert_category "${eventy_id}" "ForestBar" "forestbar" >/dev/null

echo "── 3/4 Produkty ──"
tax_8="$(find_tax_group_by_rate 8)"
tax_23="$(find_tax_group_by_rate 23)"
tax_8="${tax_8:-0}"
tax_23="${tax_23:-0}"

retail_id="$(upsert_product "Kanapka z łososiem" "kanapka-z-lososiem" "${kanapki_id}" "24.99" "${tax_8}" "1" "100" "0")"
assign_feature_to_product "${retail_id}" "${feature_id}" "${fv_retail}"

event_id="$(upsert_product "Bankiet premium – 4h" "bankiet-premium-4h" "${bankiet_id}" "189.00" "${tax_23}" "10" "0" "1")"
assign_feature_to_product "${event_id}" "${feature_id}" "${fv_event}"

echo "── 4/4 Personalizacja produktu event ──"
add_event_customization_fields "${event_id}"

echo ""
echo "Model danych załadowany poprawnie."
echo "- Feature: Typ biznesowy (retail/event)"
echo "- Kategorie: Menu + Eventy"
echo "- Produkty: Kanapka z łososiem, Bankiet premium – 4h"
