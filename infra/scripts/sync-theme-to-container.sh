#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_DIR="$(cd "${INFRA_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
THEME_NAME="forestcatering-premium"
THEME_SRC="${REPO_DIR}/themes/${THEME_NAME}"
THEME_DST="/var/www/html/themes/${THEME_NAME}"
RUN_LOG="${LOG_DIR}/theme-sync-$(date +%Y%m%d-%H%M%S).log"
LAST_LOG="${LOG_DIR}/theme-sync-last.log"
MIRROR_LAST="${MIRROR_DIR}/theme-sync-last.log"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

log() {
  printf '[sync-theme] %s\n' "$1" | tee -a "${RUN_LOG}"
}

mirror_last() {
  cp "${RUN_LOG}" "${LAST_LOG}"
  cp "${LAST_LOG}" "${MIRROR_LAST}"
}

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

if [[ ! -d "${THEME_SRC}" ]]; then
  echo "theme source not found: ${THEME_SRC}" >&2
  exit 1
fi

COMPOSE=(docker compose -f "${COMPOSE_FILE}")
CID="$(${COMPOSE[@]} ps -q prestashop)"
if [[ -z "${CID}" ]]; then
  log "prestashop container not running; starting service"
  ${COMPOSE[@]} up -d prestashop >>"${RUN_LOG}" 2>&1
  CID="$(${COMPOSE[@]} ps -q prestashop)"
fi

if [[ -z "${CID}" ]]; then
  log "failed to resolve prestashop container"
  mirror_last
  exit 1
fi

log "container=${CID}"
log "copying ${THEME_SRC} -> ${THEME_DST}"
docker exec "${CID}" mkdir -p "${THEME_DST}" >>"${RUN_LOG}" 2>&1
docker cp "${THEME_SRC}/." "${CID}:${THEME_DST}/" >>"${RUN_LOG}" 2>&1

log "setting ownership and clearing cache"
docker exec "${CID}" sh -lc "chown -R www-data:www-data '${THEME_DST}' && rm -rf /var/www/html/var/cache/*" >>"${RUN_LOG}" 2>&1

log "sync complete"
mirror_last
