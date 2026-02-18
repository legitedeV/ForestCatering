#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
INFRA_DIR="${REPO_ROOT}/infra"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
PROJECT="${COMPOSE_PROJECT_NAME:-forestcatering}"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/deploy-${TS}.log"
exec > >(tee -a "${LOG_FILE}") 2>&1

compose() {
  if [[ -f "${ENV_FILE}" ]]; then
    docker compose -p "${PROJECT}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
  else
    docker compose -p "${PROJECT}" -f "${COMPOSE_FILE}" "$@"
  fi
}

mirror_deploy_log() {
  local tmp_file="${MIRROR_DIR}/deploy-last.log.tmp"
  cp "${LOG_FILE}" "${tmp_file}"
  mv -f "${tmp_file}" "${MIRROR_DIR}/deploy-last.log"
}

cd "${REPO_ROOT}"

echo "[deploy] started at $(date -Is)"

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] docker is not installed" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[deploy] docker compose plugin is not available" >&2
  exit 1
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "[deploy] compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

./infra/scripts/ensure-host-tools.sh

compose_path="$(realpath "${COMPOSE_FILE}")"
duplicate_count="$(docker compose ls --format json | jq -r --arg cfg "${compose_path}" '[.[] | select((.ConfigFiles // "") | contains($cfg)) | .Name] | unique | length')"
if (( duplicate_count > 1 )); then
  echo "[deploy] duplicate compose projects detected (${duplicate_count}), cleaning up"
  ./infra/scripts/compose-down-all.sh
fi

echo "[deploy] validating compose config"
compose config >/dev/null

echo "[deploy] pulling images"
compose pull || echo "[deploy] warning: compose pull failed; continuing with local images"

echo "[deploy] starting stack"
compose up -d --force-recreate

echo "[deploy] ensuring nginx site"
./infra/scripts/ensure-nginx-site.sh

echo "[deploy] summary"
echo "commit: $(git rev-parse HEAD)"
compose ps

mirror_deploy_log

echo "[deploy] log: ${LOG_FILE}"
echo "[deploy] mirror: ${MIRROR_DIR}/deploy-last.log"
