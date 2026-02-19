#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
THEME_NAME="forestcatering-premium"
THEME_DIR="/var/www/html/themes/${THEME_NAME}"
RUN_LOG="${LOG_DIR}/theme-validate-$(date +%Y%m%d-%H%M%S).log"
LAST_LOG="${LOG_DIR}/theme-validate-last.log"
MIRROR_LAST="${MIRROR_DIR}/theme-validate-last.log"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

log() {
  printf '[theme-validate] %s\n' "$1" | tee -a "${RUN_LOG}"
}

fail() {
  log "ERROR: $1"
  cp "${RUN_LOG}" "${LAST_LOG}"
  cp "${LAST_LOG}" "${MIRROR_LAST}"
  exit 1
}

COMPOSE=(docker compose -f "${COMPOSE_FILE}")
CID="$(${COMPOSE[@]} ps -q prestashop)"
[[ -n "${CID}" ]] || fail "prestashop container is not running"

theme_yml="${THEME_DIR}/config/theme.yml"

docker exec "${CID}" test -f "${theme_yml}" || fail "missing ${theme_yml}"

required_lines=(
  "meta:"
  "available_layouts:"
  "default_layout:"
  "parent:"
  "assets:"
)
for line in "${required_lines[@]}"; do
  docker exec "${CID}" sh -lc "grep -q '${line}' '${theme_yml}'" || fail "theme.yml missing required key pattern: ${line}"
done

layout_keys=(
  "layout-full-width"
  "layout-left-column"
  "layout-right-column"
  "layout-both-columns"
)

for key in "${layout_keys[@]}"; do
  yml="${THEME_DIR}/config/layouts/${key}.yml"
  tpl="${THEME_DIR}/templates/layouts/${key}.tpl"
  docker exec "${CID}" test -f "${yml}" || fail "missing layout config: ${yml}"
  docker exec "${CID}" test -f "${tpl}" || fail "missing layout template: ${tpl}"
  docker exec "${CID}" sh -lc "grep -q '^name:[[:space:]]*${key}$' '${yml}'" || fail "invalid name in ${yml}"
  docker exec "${CID}" sh -lc "grep -q '^display_name:' '${yml}'" || fail "missing display_name in ${yml}"
  docker exec "${CID}" sh -lc "grep -q '^template:[[:space:]]*layouts/${key}.tpl$' '${yml}'" || fail "invalid template in ${yml}"
done

log "validation successful"
cp "${RUN_LOG}" "${LAST_LOG}"
cp "${LAST_LOG}" "${MIRROR_LAST}"
