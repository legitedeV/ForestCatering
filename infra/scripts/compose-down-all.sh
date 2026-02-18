#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
PROJECT_DEFAULT="${COMPOSE_PROJECT_NAME:-forestcatering}"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

LATEST_FULL_FIX_LOG="$(ls -1t "${LOG_DIR}"/full-fix-*.log 2>/dev/null | head -n 1 || true)"
if [[ -z "${LATEST_FULL_FIX_LOG}" ]]; then
  LATEST_FULL_FIX_LOG="${LOG_DIR}/full-fix-$(date +%Y%m%d-%H%M%S).log"
  touch "${LATEST_FULL_FIX_LOG}"
fi

log() {
  printf '[compose-down-all] %s\n' "$1" | tee -a "${LATEST_FULL_FIX_LOG}"
}

mirror_log() {
  local tmp_file="${MIRROR_DIR}/full-fix-last.log.tmp"
  cp "${LATEST_FULL_FIX_LOG}" "${tmp_file}"
  mv -f "${tmp_file}" "${MIRROR_DIR}/full-fix-last.log"
}

if ! command -v docker >/dev/null 2>&1; then
  log "docker not found"
  mirror_log
  exit 1
fi

compose_path="$(realpath "${COMPOSE_FILE}")"
mapfile -t projects < <(docker compose ls --format json 2>/dev/null | jq -r --arg cfg "${compose_path}" '.[] | select((.ConfigFiles // "") | contains($cfg)) | .Name' | sort -u)

if (( ${#projects[@]} == 0 )); then
  projects=("${PROJECT_DEFAULT}" "forestcatering-infra")
fi

for project in "${projects[@]}"; do
  [[ -z "${project}" ]] && continue
  log "bringing down project: ${project}"
  if [[ -f "${ENV_FILE}" ]]; then
    docker compose -p "${project}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" down --remove-orphans >> "${LATEST_FULL_FIX_LOG}" 2>&1 || true
  else
    docker compose -p "${project}" -f "${COMPOSE_FILE}" down --remove-orphans >> "${LATEST_FULL_FIX_LOG}" 2>&1 || true
  fi
done

mirror_log
log "completed"
