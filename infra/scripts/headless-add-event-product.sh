#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
# headless-add-event-product.sh
# Add event-specific customization fields to a product and
# assign business_type=event feature.
#
# Usage:  ./infra/scripts/headless-add-event-product.sh <id_product> [min_qty]
#   id_product  – PrestaShop product ID
#   min_qty     – minimum quantity (default: 10)
# ────────────────────────────────────────────────────────────
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

id_product="${1:-}"
min_qty="${2:-10}"

if [[ -z "${id_product}" ]]; then
  echo "Użycie: $0 <id_product> [min_qty]" >&2
  exit 1
fi

db_cid="$(compose_cmd ps -q mariadb)"
db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang WHERE iso_code='pl' LIMIT 1;")"
if [[ -z "${pl_lang_id}" ]]; then
  pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang ORDER BY id_lang ASC LIMIT 1;")"
fi

# Verify product exists
prod_exists="$(run_sql "SELECT id_product FROM ps_product WHERE id_product=${id_product} LIMIT 1;")"
if [[ -z "${prod_exists}" ]]; then
  echo "Produkt id=${id_product} nie istnieje." >&2
  exit 1
fi

echo "Konfiguracja produktu EVENT: id=${id_product}, min_qty=${min_qty}"

# ── Set minimal quantity ──
run_sql "UPDATE ps_product_shop SET minimal_quantity=${min_qty} WHERE id_product=${id_product};"
run_sql "UPDATE ps_product SET minimal_quantity=${min_qty} WHERE id_product=${id_product};"
echo "  minimal_quantity = ${min_qty}"

# ── Assign business_type = event feature ──
feature_id="$(run_sql "SELECT fl.id_feature FROM ps_feature_lang fl
  WHERE fl.name='business_type' AND fl.id_lang=${pl_lang_id} LIMIT 1;")"
if [[ -z "${feature_id}" ]]; then
  echo "  Feature 'business_type' nie istnieje. Uruchom najpierw headless-setup.sh." >&2
  exit 1
fi

event_fv_id="$(run_sql "SELECT fvl.id_feature_value FROM ps_feature_value_lang fvl
  JOIN ps_feature_value fv ON fv.id_feature_value = fvl.id_feature_value
  WHERE fv.id_feature=${feature_id} AND fvl.value='event' AND fvl.id_lang=${pl_lang_id} LIMIT 1;")"

if [[ -n "${event_fv_id}" ]]; then
  run_sql "DELETE FROM ps_feature_product WHERE id_product=${id_product} AND id_feature=${feature_id};"
  run_sql "INSERT INTO ps_feature_product (id_feature, id_product, id_feature_value) VALUES (${feature_id}, ${id_product}, ${event_fv_id});"
  echo "  business_type = event (fv_id=${event_fv_id})"
fi

# ── Add customization fields ──
# PrestaShop customization field types: 0 = file, 1 = text
fields=(
  "Liczba osób:1:1"
  "Data wydarzenia:1:1"
  "Godzina wydarzenia:1:1"
  "Adres realizacji:1:1"
  "Dodatkowe uwagi:1:0"
)

# Enable customization on product
run_sql "UPDATE ps_product SET customizable=1 WHERE id_product=${id_product};"
run_sql "UPDATE ps_product_shop SET customizable=1 WHERE id_product=${id_product};"

for field_def in "${fields[@]}"; do
  IFS=':' read -r fname ftype frequired <<< "${field_def}"

  # Check if already exists
  existing="$(run_sql "SELECT cf.id_customization_field FROM ps_customization_field cf
    JOIN ps_customization_field_lang cfl ON cfl.id_customization_field = cf.id_customization_field
    WHERE cf.id_product=${id_product} AND cfl.name='${fname}' AND cfl.id_lang=${pl_lang_id} LIMIT 1;" 2>/dev/null || true)"

  if [[ -z "${existing}" ]]; then
    run_sql "INSERT INTO ps_customization_field (id_product, type, required, is_module, is_deleted)
      VALUES (${id_product}, ${ftype}, ${frequired}, 0, 0);"
    cf_id="$(run_sql "SELECT LAST_INSERT_ID();")"

    lang_ids="$(run_sql "SELECT id_lang FROM ps_lang;")"
    while IFS= read -r lid; do
      [[ -z "${lid}" ]] && continue
      run_sql "INSERT IGNORE INTO ps_customization_field_lang (id_customization_field, id_lang, name)
        VALUES (${cf_id}, ${lid}, '${fname}');"
    done <<< "${lang_ids}"
    echo "  Dodano pole: ${fname} (id=${cf_id}, wymagane=${frequired})"
  else
    echo "  Pole istnieje: ${fname} (id=${existing})"
  fi
done

# Update text/file field counts on product
text_count="$(run_sql "SELECT COUNT(*) FROM ps_customization_field WHERE id_product=${id_product} AND type=1 AND is_deleted=0;")"
file_count="$(run_sql "SELECT COUNT(*) FROM ps_customization_field WHERE id_product=${id_product} AND type=0 AND is_deleted=0;")"
run_sql "UPDATE ps_product SET text_fields=${text_count}, uploadable_files=${file_count} WHERE id_product=${id_product};"
run_sql "UPDATE ps_product_shop SET text_fields=${text_count}, uploadable_files=${file_count} WHERE id_product=${id_product};"

echo ""
echo "Produkt id=${id_product} skonfigurowany jako EVENT."
echo "  minimal_quantity=${min_qty}, text_fields=${text_count}, customizable=1"
