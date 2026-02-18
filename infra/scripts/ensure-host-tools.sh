#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

LATEST_FULL_FIX_LOG="$(ls -1t "${LOG_DIR}"/full-fix-*.log 2>/dev/null | head -n 1 || true)"
if [[ -z "${LATEST_FULL_FIX_LOG}" ]]; then
  LATEST_FULL_FIX_LOG="${LOG_DIR}/full-fix-$(date +%Y%m%d-%H%M%S).log"
  touch "${LATEST_FULL_FIX_LOG}"
fi

log() {
  local msg="$1"
  printf '[ensure-host-tools] %s\n' "${msg}" | tee -a "${LATEST_FULL_FIX_LOG}"
}

mirror_log() {
  local tmp_file="${MIRROR_DIR}/full-fix-last.log.tmp"
  cp "${LATEST_FULL_FIX_LOG}" "${tmp_file}"
  mv -f "${tmp_file}" "${MIRROR_DIR}/full-fix-last.log"
}

need_install=0
missing=()
for cmd in lsof ss jq; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    need_install=1
    missing+=("${cmd}")
  fi
done

if (( need_install == 1 )); then
  log "missing tools: ${missing[*]}"
  log "running apt-get update"
  sudo apt-get update >> "${LATEST_FULL_FIX_LOG}" 2>&1
  log "installing lsof iproute2 jq"
  sudo apt-get install -y lsof iproute2 jq >> "${LATEST_FULL_FIX_LOG}" 2>&1
else
  log "all required tools already installed"
fi

for cmd in lsof ss jq; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    log "validation failed: ${cmd} still unavailable"
    mirror_log
    exit 1
  fi
  log "validated tool: ${cmd}"
done

mirror_log
log "completed"
