#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
LOG_ROOT="${BASE_DIR}/logs"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
RUN_DIR="${LOG_ROOT}/run-${TIMESTAMP}"

mkdir -p "${RUN_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." | tee "${RUN_DIR}/error.txt"
  exit 1
fi

source "${ENV_FILE}"

exec > >(tee "${RUN_DIR}/smoke.log") 2>&1

echo "== ForestCatering infra smoke test: ${TIMESTAMP} =="

echo "[1/9] docker compose config"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" config > "${RUN_DIR}/compose-config.yml"

echo "[2/9] start services"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" up -d

wait_for_health() {
  local service="$1"
  local timeout_seconds="$2"
  local elapsed=0
  local container
  container="$(docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" ps -q "${service}")"
  if [[ -z "${container}" ]]; then
    echo "Service ${service} container not found" >&2
    return 1
  fi

  while (( elapsed < timeout_seconds )); do
    status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${container}")"
    if [[ "${status}" == "healthy" ]]; then
      echo "${service} is healthy"
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Service ${service} did not become healthy in ${timeout_seconds}s" >&2
  return 1
}

echo "[3/9] wait for health"
wait_for_health mariadb 180
wait_for_health redis 120

echo "[4/9] DB functional test"
TMP_DB="smoke_${TIMESTAMP//-/}"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T mariadb sh -lc "mysql -uroot -p\"$MARIADB_ROOT_PASSWORD\" <<SQL
CREATE DATABASE ${TMP_DB};
USE ${TMP_DB};
CREATE TABLE health_test (id INT PRIMARY KEY, note VARCHAR(64));
INSERT INTO health_test (id, note) VALUES (1, 'ok');
SELECT * FROM health_test;
DROP DATABASE ${TMP_DB};
SQL"

echo "[5/9] Redis ping"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T redis redis-cli ping

echo "[6/9] versions"
{
  docker --version
  docker compose version
  docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T mariadb mariadb --version
  docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T redis redis-server --version
} | tee "${RUN_DIR}/versions.txt"

echo "[7/9] backup and listing"
"${BASE_DIR}/scripts/backup-db.sh" | tee "${RUN_DIR}/backup-create.txt"
"${BASE_DIR}/scripts/rotate-backups.sh" | tee "${RUN_DIR}/backup-rotate.txt"
ls -lah "${BASE_DIR}/backups" | tee "${RUN_DIR}/backup-list.txt"

echo "[8/9] compose diagnostics"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" ps | tee "${RUN_DIR}/compose-ps.txt"
docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" logs --tail=200 > "${RUN_DIR}/compose-logs-tail200.txt"
cp "${RUN_DIR}/compose-ps.txt" "${RUN_DIR}/infra-screenshot-compose-ps.txt"

echo "[9/9] publish mirror"
"${BASE_DIR}/scripts/publish-mirror.sh" "${RUN_DIR}" | tee "${RUN_DIR}/mirror-publish.txt"

MIRROR_BASE_URL="${MIRROR_BASE_URL:-http://kadryhr.pl/mirror/forestcatering-infra}"
RUN_NAME="$(basename "${RUN_DIR}")"

echo "Smoke test completed."
echo "Mirror run URL: ${MIRROR_BASE_URL}/${RUN_NAME}/"
echo "Mirror screenshot artifact: ${MIRROR_BASE_URL}/${RUN_NAME}/infra-screenshot-compose-ps.txt"
