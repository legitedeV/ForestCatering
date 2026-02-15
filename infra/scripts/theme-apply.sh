#!/usr/bin/env bash
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

theme_src="${INFRA_DIR}/theme/forestcatering-premium"
theme_target="/var/www/html/themes/forestcatering-premium"

docker exec "${ps_cid}" rm -rf "${theme_target}"
docker exec "${ps_cid}" mkdir -p "${theme_target}"
docker cp "${theme_src}/." "${ps_cid}:${theme_target}/"

"${SCRIPT_DIR}/theme-assets-install.sh" "${ps_cid}"

db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

if [[ -z "$(run_sql "SHOW TABLES LIKE 'ps_theme';")" ]]; then
  echo "Brak tabeli ps_theme — instalacja PrestaShop nie jest ukończona." >&2
  exit 1
fi

existing_theme_id="$(run_sql "SELECT id_theme FROM ps_theme WHERE directory='forestcatering-premium' LIMIT 1;")"
if [[ -z "${existing_theme_id}" ]]; then
  cols="$(run_sql "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${db_name}' AND TABLE_NAME='ps_theme' AND COLUMN_NAME <> 'id_theme' ORDER BY ORDINAL_POSITION;")"
  select_parts=()
  while IFS= read -r col; do
    case "${col}" in
      name) select_parts+=("'ForestCatering Premium' AS name") ;;
      directory) select_parts+=("'forestcatering-premium' AS directory") ;;
      *) select_parts+=("${col}") ;;
    esac
  done <<< "${cols}"
  select_sql="$(IFS=,; echo "${select_parts[*]}")"
  run_sql "INSERT INTO ps_theme ($(echo "${cols}" | paste -sd ',' -)) SELECT ${select_sql} FROM ps_theme WHERE directory='classic' LIMIT 1;"
  existing_theme_id="$(run_sql "SELECT id_theme FROM ps_theme WHERE directory='forestcatering-premium' LIMIT 1;")"
fi

if [[ -z "${existing_theme_id}" ]]; then
  echo "Nie udało się utworzyć wpisu motywu w ps_theme." >&2
  exit 1
fi

run_sql "INSERT IGNORE INTO ps_theme_shop (id_theme,id_shop) SELECT ${existing_theme_id}, id_shop FROM ps_shop;"
run_sql "UPDATE ps_shop SET id_theme=${existing_theme_id};"

pl_lang_id="$(run_sql "SELECT id_lang FROM ps_lang WHERE iso_code='pl' LIMIT 1;")"
if [[ -z "${pl_lang_id}" ]]; then
  echo "Brak języka polskiego w ps_lang. Wymagana instalacja języka PL w obrazie PrestaShop." >&2
  exit 1
fi
run_sql "UPDATE ps_configuration SET value='${pl_lang_id}' WHERE name='PS_LANG_DEFAULT';"

if docker exec "${ps_cid}" test -f /var/www/html/bin/console; then
  docker exec "${ps_cid}" php /var/www/html/bin/console cache:clear --no-warmup --env=prod >/dev/null || true
fi

docker exec "${ps_cid}" chown -R www-data:www-data "${theme_target}" >/dev/null 2>&1 || true

echo "Zastosowano motyw forestcatering-premium (id_theme=${existing_theme_id}), PS_LANG_DEFAULT=${pl_lang_id}."
