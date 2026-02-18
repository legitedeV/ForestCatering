#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
INFRA_DIR="${REPO_ROOT}/infra"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/deploy-${TS}.log"

exec > >(tee -a "${LOG_FILE}") 2>&1

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

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[deploy] env file not found: ${ENV_FILE}" >&2
  exit 1
fi

compose() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

echo "[deploy] validating compose config"
compose config >/dev/null

echo "[deploy] pulling images"
if ! compose pull; then
  echo "[deploy] warning: compose pull failed; continuing with local images"
fi

echo "[deploy] starting stack"
compose up -d --build

echo "[deploy] container status"
compose ps

echo "[deploy] verify frontend service is absent"
if compose ps | grep -qi frontend; then
  echo "[deploy] frontend container detected but stack must be presta-only" >&2
  exit 1
fi

echo "[deploy] waiting for healthy containers (timeout 120s per container with healthcheck)"
mapfile -t CONTAINER_IDS < <(compose ps -q)
for cid in "${CONTAINER_IDS[@]:-}"; do
  [[ -z "${cid}" ]] && continue
  has_health="$(docker inspect -f '{{if .State.Health}}yes{{else}}no{{end}}' "${cid}")"
  name="$(docker inspect -f '{{.Name}}' "${cid}" | sed 's#^/##')"
  if [[ "${has_health}" != "yes" ]]; then
    echo "[deploy] ${name}: no healthcheck, skipping wait"
    continue
  fi

  start="$(date +%s)"
  while true; do
    health="$(docker inspect -f '{{.State.Health.Status}}' "${cid}" 2>/dev/null || true)"
    if [[ "${health}" == "healthy" ]]; then
      echo "[deploy] ${name}: healthy"
      break
    fi

    elapsed="$(( $(date +%s) - start ))"
    if (( elapsed >= 120 )); then
      echo "[deploy] ${name}: failed to become healthy in 120s (last status: ${health:-unknown})" >&2
      exit 1
    fi

    sleep 3
  done
done

echo "[deploy] clearing prestashop cache"
CID_PS="$(compose ps -q prestashop)"
if [[ -z "${CID_PS}" ]]; then
  echo "[deploy] prestashop container not found" >&2
  exit 1
fi
docker exec "${CID_PS}" sh -lc 'rm -rf /var/www/html/var/cache/* || true'

echo "[deploy] restarting prestashop"
compose restart prestashop

echo "[deploy] running smoke checks"
TARGET_HOST="${TARGET_HOST:-51.68.151.159}" ./infra/scripts/smoke.sh

echo "[deploy] summary"
echo "commit: $(git rev-parse HEAD)"
compose ps
if compose ps | grep -qi frontend; then
  echo "[deploy] summary check failed: frontend container should not exist" >&2
  exit 1
fi

tmp_mirror="${MIRROR_DIR}/deploy-last.log.tmp"
cp "${LOG_FILE}" "${tmp_mirror}"
mv -f "${tmp_mirror}" "${MIRROR_DIR}/deploy-last.log"

echo "[deploy] log: ${LOG_FILE}"
echo "[deploy] mirror: ${MIRROR_DIR}/deploy-last.log"
