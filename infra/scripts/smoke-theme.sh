#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
THEME_NAME="forestcatering-premium"
RUN_LOG="${LOG_DIR}/smoke-theme-$(date +%Y%m%d-%H%M%S).log"
LAST_LOG="${LOG_DIR}/smoke-theme-last.log"
MIRROR_LAST="${MIRROR_DIR}/smoke-theme-last.log"
DEBUG_DIR="${LOG_DIR}/smoke-theme-debug-$(date +%Y%m%d-%H%M%S)"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

log() {
  printf '[smoke-theme] %s\n' "$1" | tee -a "${RUN_LOG}"
}

finalize() {
  cp "${RUN_LOG}" "${LAST_LOG}"
  cp "${LAST_LOG}" "${MIRROR_LAST}"
}

collect_debug() {
  mkdir -p "${DEBUG_DIR}"
  docker compose -f "${COMPOSE_FILE}" ps >"${DEBUG_DIR}/compose-ps.txt" 2>&1 || true
  docker compose -f "${COMPOSE_FILE}" logs --tail=300 prestashop mariadb >"${DEBUG_DIR}/compose-logs-tail.txt" 2>&1 || true
  log "debug bundle collected: ${DEBUG_DIR}"
}

run_step() {
  local script_name="$1"
  if ! "${SCRIPT_DIR}/${script_name}" >>"${RUN_LOG}" 2>&1; then
    log "${script_name} failed"
    collect_debug
    finalize
    exit 1
  fi
}

run_sql() {
  docker exec "${DB_CID}" mariadb -N -uroot -p"${DB_ROOT}" "${DB_NAME}" -e "$1"
}

check_head() {
  local url="$1"
  local name="$2"
  local hdr
  local code

  hdr="$(curl -sS -I "${url}")"
  code="$(awk 'toupper($1) ~ /^HTTP\// {c=$2} END {print c}' <<<"${hdr}")"

  log "${name}: ${url} -> ${code}"
  if [[ "${code}" != "200" && "${code}" != "302" ]]; then
    log "${name}: invalid HTTP status ${code}"
    return 1
  fi

  if grep -i '^Location: .*localhost' <<<"${hdr}" >/dev/null; then
    log "${name}: invalid redirect contains localhost"
    return 1
  fi
}

run_step "sync-theme-to-container.sh"
run_step "theme-validate.sh"
run_step "theme-apply.sh"

COMPOSE=(docker compose -f "${COMPOSE_FILE}")
${COMPOSE[@]} up -d mariadb >>"${RUN_LOG}" 2>&1
DB_CID="$(${COMPOSE[@]} ps -q mariadb)"
DB_NAME="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
DB_ROOT="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
DB_PREFIX="$(awk -F= '/^DB_PREFIX=/{print $2}' "${ENV_FILE}")"

if [[ -z "${DB_CID}" || -z "${DB_NAME}" || -z "${DB_ROOT}" || -z "${DB_PREFIX}" ]]; then
  log "ERROR: unable to resolve DB connection parameters"
  collect_debug
  finalize
  exit 1
fi

ACTIVE_TOTAL="$(run_sql "SELECT COUNT(*) FROM ${DB_PREFIX}shop WHERE active=1 AND deleted=0;")"
MISMATCH_TOTAL="$(run_sql "SELECT COUNT(*) FROM ${DB_PREFIX}shop WHERE active=1 AND deleted=0 AND theme_name<>'${THEME_NAME}';")"
ACTIVE_THEMES="$(run_sql "SELECT theme_name FROM ${DB_PREFIX}shop WHERE active=1 AND deleted=0 ORDER BY id_shop;")"

log "active shop theme_name rows: ${ACTIVE_THEMES//$'\n'/, }"

if [[ "${ACTIVE_TOTAL}" -lt 1 ]]; then
  log "ERROR: no active/non-deleted shops found"
  collect_debug
  finalize
  exit 1
fi

if [[ "${MISMATCH_TOTAL}" -ne 0 ]]; then
  log "ERROR: ${MISMATCH_TOTAL} active shop(s) not set to ${THEME_NAME}"
  collect_debug
  finalize
  exit 1
fi

if ! check_head "http://127.0.0.1:8080/" "storefront"; then
  log "storefront health check failed"
  collect_debug
  finalize
  exit 1
fi

if ! check_head "http://127.0.0.1:8080/admin-dev/" "admin"; then
  log "admin health check failed"
  collect_debug
  finalize
  exit 1
fi

log "smoke-theme passed"
finalize
