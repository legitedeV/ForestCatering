#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
THEME_NAME="forestcatering-premium"
RUN_LOG="${LOG_DIR}/theme-apply-$(date +%Y%m%d-%H%M%S).log"
LAST_LOG="${LOG_DIR}/theme-apply-last.log"
MIRROR_LAST="${MIRROR_DIR}/theme-apply-last.log"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

log() {
  printf '[theme-apply] %s\n' "$1" | tee -a "${RUN_LOG}"
}

finalize() {
  cp "${RUN_LOG}" "${LAST_LOG}"
  cp "${LAST_LOG}" "${MIRROR_LAST}"
}

COMPOSE=(docker compose -f "${COMPOSE_FILE}")
${COMPOSE[@]} up -d prestashop mariadb >>"${RUN_LOG}" 2>&1
PS_CID="$(${COMPOSE[@]} ps -q prestashop)"
DB_CID="$(${COMPOSE[@]} ps -q mariadb)"

if [[ -z "${PS_CID}" || -z "${DB_CID}" ]]; then
  log "ERROR: containers prestashop/mariadb unavailable"
  finalize
  exit 1
fi

CLI_APPLIED=0
if docker exec "${PS_CID}" test -f /var/www/html/bin/console; then
  log "bin/console found; checking available theme commands"
  CMD_LIST="$(docker exec "${PS_CID}" php /var/www/html/bin/console list --raw 2>/dev/null || true)"
  if grep -q '^prestashop:theme:install$' <<<"${CMD_LIST}"; then
    log "running prestashop:theme:install ${THEME_NAME}"
    docker exec "${PS_CID}" php /var/www/html/bin/console prestashop:theme:install "${THEME_NAME}" >>"${RUN_LOG}" 2>&1 || true
  fi
  if grep -q '^prestashop:theme:enable$' <<<"${CMD_LIST}"; then
    log "running prestashop:theme:enable ${THEME_NAME}"
    docker exec "${PS_CID}" php /var/www/html/bin/console prestashop:theme:enable "${THEME_NAME}" >>"${RUN_LOG}" 2>&1 && CLI_APPLIED=1 || true
  fi
fi

if [[ "${CLI_APPLIED}" -ne 1 ]]; then
  log "falling back to SQL theme assignment"
  DB_NAME="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
  DB_ROOT="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
  run_sql() {
    docker exec "${DB_CID}" mariadb -N -uroot -p"${DB_ROOT}" "${DB_NAME}" -e "$1"
  }

  THEME_ID="$(run_sql "SELECT id_theme FROM ps_theme WHERE directory='${THEME_NAME}' LIMIT 1;")"
  if [[ -z "${THEME_ID}" ]]; then
    run_sql "INSERT INTO ps_theme (name, directory) VALUES ('ForestCatering Premium', '${THEME_NAME}');"
    THEME_ID="$(run_sql "SELECT id_theme FROM ps_theme WHERE directory='${THEME_NAME}' LIMIT 1;")"
  fi
  if [[ -z "${THEME_ID}" ]]; then
    log "ERROR: unable to resolve theme id for ${THEME_NAME}"
    finalize
    exit 1
  fi

  run_sql "INSERT IGNORE INTO ps_theme_shop (id_theme,id_shop) SELECT ${THEME_ID}, id_shop FROM ps_shop;"
  run_sql "UPDATE ps_shop SET id_theme=${THEME_ID};"
  run_sql "UPDATE ps_configuration SET value='${THEME_NAME}' WHERE name='PS_THEME_NAME';"
  log "SQL assignment completed for id_theme=${THEME_ID}"
fi

log "clearing cache"
docker exec "${PS_CID}" sh -lc 'rm -rf /var/www/html/var/cache/*' >>"${RUN_LOG}" 2>&1 || true
docker exec "${PS_CID}" chown -R www-data:www-data "/var/www/html/themes/${THEME_NAME}" >>"${RUN_LOG}" 2>&1 || true

log "theme apply complete"
finalize
