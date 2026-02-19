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

DB_NAME="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
DB_ROOT="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
DB_PREFIX="$(awk -F= '/^DB_PREFIX=/{print $2}' "${ENV_FILE}")"

if [[ -z "${DB_NAME}" || -z "${DB_ROOT}" || -z "${DB_PREFIX}" ]]; then
  log "ERROR: required DB settings missing in ${ENV_FILE}"
  finalize
  exit 1
fi

run_sql() {
  docker exec "${DB_CID}" mariadb -N -uroot -p"${DB_ROOT}" "${DB_NAME}" -e "$1"
}

CLI_APPLIED=0
if docker exec "${PS_CID}" test -f /var/www/html/bin/console; then
  log "bin/console found; checking available theme commands"
  CMD_LIST="$(docker exec "${PS_CID}" php /var/www/html/bin/console list --raw 2>/dev/null || true)"
  ENABLE_CMD=""
  if grep -q '^prestashop:theme:enable$' <<<"${CMD_LIST}"; then
    ENABLE_CMD="prestashop:theme:enable"
  elif grep -q '^theme:enable$' <<<"${CMD_LIST}"; then
    ENABLE_CMD="theme:enable"
  fi

  if [[ -n "${ENABLE_CMD}" ]]; then
    log "running ${ENABLE_CMD} ${THEME_NAME}"
    if docker exec "${PS_CID}" php /var/www/html/bin/console "${ENABLE_CMD}" "${THEME_NAME}" >>"${RUN_LOG}" 2>&1; then
      CLI_APPLIED=1
      log "theme enabled via CLI"
    else
      log "CLI theme enable failed; switching to DB fallback"
    fi
  else
    log "no theme enable command found in console; switching to DB fallback"
  fi
else
  log "bin/console not found; switching to DB fallback"
fi

if [[ "${CLI_APPLIED}" -ne 1 ]]; then
  log "running DB fallback using ${DB_PREFIX}shop.theme_name"

  if ! run_sql "SHOW TABLES LIKE '${DB_PREFIX}shop';" | grep -qx "${DB_PREFIX}shop"; then
    log "ERROR: missing required table ${DB_PREFIX}shop"
    log "diagnostic tables:"
    run_sql "SHOW TABLES;" | tee -a "${RUN_LOG}" >/dev/null
    finalize
    exit 1
  fi

  if ! run_sql "SHOW COLUMNS FROM ${DB_PREFIX}shop LIKE 'theme_name';" | grep -q '^theme_name'; then
    log "ERROR: missing required column ${DB_PREFIX}shop.theme_name"
    log "diagnostic columns for ${DB_PREFIX}shop:"
    run_sql "SHOW COLUMNS FROM ${DB_PREFIX}shop;" | tee -a "${RUN_LOG}" >/dev/null
    finalize
    exit 1
  fi

  run_sql "UPDATE ${DB_PREFIX}shop SET theme_name='${THEME_NAME}' WHERE active=1 AND deleted=0;" >>"${RUN_LOG}" 2>&1
  log "DB fallback update applied to active/non-deleted shops"
fi

log "clearing cache"
docker exec "${PS_CID}" sh -lc 'rm -rf /var/www/html/var/cache/*' >>"${RUN_LOG}" 2>&1
docker exec "${PS_CID}" chown -R www-data:www-data "/var/www/html/themes/${THEME_NAME}" >>"${RUN_LOG}" 2>&1

log "theme apply complete"
finalize
