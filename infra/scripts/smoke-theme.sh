#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
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

check_head() {
  local url="$1"
  local name="$2"
  local code
  code="$(curl -sS -I -o /dev/null -w '%{http_code}' "${url}")"
  log "${name}: ${url} -> ${code}"
  if [[ "${code}" != "200" && "${code}" != "302" ]]; then
    return 1
  fi
}

if ! "${SCRIPT_DIR}/theme-validate.sh" >>"${RUN_LOG}" 2>&1; then
  log "validation failed"
  collect_debug
  finalize
  exit 1
fi

if ! "${SCRIPT_DIR}/theme-apply.sh" >>"${RUN_LOG}" 2>&1; then
  log "apply failed"
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
