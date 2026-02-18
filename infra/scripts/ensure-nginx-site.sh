#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE_FILE="${INFRA_DIR}/nginx/forestcatering-ip.conf"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
SITE_AVAILABLE="/etc/nginx/sites-available/forestcatering-ip"
SITE_ENABLED="/etc/nginx/sites-enabled/forestcatering-ip"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

LATEST_FULL_FIX_LOG="$(ls -1t "${LOG_DIR}"/full-fix-*.log 2>/dev/null | head -n 1 || true)"
if [[ -z "${LATEST_FULL_FIX_LOG}" ]]; then
  LATEST_FULL_FIX_LOG="${LOG_DIR}/full-fix-$(date +%Y%m%d-%H%M%S).log"
  touch "${LATEST_FULL_FIX_LOG}"
fi

log() {
  printf '[ensure-nginx-site] %s\n' "$1" | tee -a "${LATEST_FULL_FIX_LOG}"
}

mirror_log() {
  local tmp_file="${MIRROR_DIR}/full-fix-last.log.tmp"
  cp "${LATEST_FULL_FIX_LOG}" "${tmp_file}"
  mv -f "${tmp_file}" "${MIRROR_DIR}/full-fix-last.log"
}

if ! command -v nginx >/dev/null 2>&1; then
  log "nginx missing; installing"
  sudo apt-get update >> "${LATEST_FULL_FIX_LOG}" 2>&1
  sudo apt-get install -y nginx >> "${LATEST_FULL_FIX_LOG}" 2>&1
fi

if [[ ! -f "${TEMPLATE_FILE}" ]]; then
  log "template not found: ${TEMPLATE_FILE}"
  mirror_log
  exit 1
fi

log "installing nginx site from repo template"
sudo install -m 0644 "${TEMPLATE_FILE}" "${SITE_AVAILABLE}"

if [[ ! -L "${SITE_ENABLED}" ]]; then
  log "creating symlink in sites-enabled"
  sudo ln -sfn "${SITE_AVAILABLE}" "${SITE_ENABLED}"
fi

log "testing nginx configuration"
sudo nginx -t >> "${LATEST_FULL_FIX_LOG}" 2>&1

log "reloading nginx"
sudo systemctl reload nginx >> "${LATEST_FULL_FIX_LOG}" 2>&1

log "capturing key nginx directives"
sudo nginx -T 2>/dev/null | grep -nE "server_name|listen|proxy_pass|location /mirror/" | head -n 80 >> "${LATEST_FULL_FIX_LOG}" || true

mirror_log
log "completed"
