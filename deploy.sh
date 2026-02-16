#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="${APP_DIR}/infra"
LOG_DIR="${INFRA_DIR}/logs/deploy-$(date +%Y%m%d-%H%M%S)"

mkdir -p "${LOG_DIR}"

echo "== ForestCatering Deploy =="
echo "App dir: ${APP_DIR}"
echo "Infra dir: ${INFRA_DIR}"
echo "Log dir: ${LOG_DIR}"

cd "${APP_DIR}"

echo "[1/8] Pull latest changes..."
git fetch origin
git reset --hard origin/main | tee "${LOG_DIR}/git-reset.log"

echo "[2/8] Validate compose..."
cd "${INFRA_DIR}"
docker compose config > /dev/null

echo "[3/8] Ensure .env exists..."
if [[ ! -f ".env" ]]; then
  echo "Missing .env. Generating..."
  ./gen-secrets.sh
fi

echo "[4/8] Stop stack..."
docker compose down | tee "${LOG_DIR}/compose-down.log"

echo "[5/8] Build (if needed)..."
docker compose build --pull | tee "${LOG_DIR}/compose-build.log"

echo "[6/8] Start stack..."
docker compose up -d | tee "${LOG_DIR}/compose-up.log"

echo "[7/8] Wait for health..."
sleep 10

echo "[8/8] Smoke test..."

# health check mariadb
MARIADB_STATUS=$(docker inspect \
  --format='{{.State.Health.Status}}' \
  "$(docker compose ps -q mariadb)")

if [[ "${MARIADB_STATUS}" != "healthy" ]]; then
  echo "MariaDB not healthy!" | tee "${LOG_DIR}/health.log"
  exit 1
fi

# check prestashop
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ || true)

echo "HTTP status: ${HTTP_CODE}" | tee "${LOG_DIR}/http.log"

if [[ "${HTTP_CODE}" != "200" && "${HTTP_CODE}" != "302" ]]; then
  echo "PrestaShop not responding correctly." | tee -a "${LOG_DIR}/http.log"
  docker compose logs --tail=200 > "${LOG_DIR}/prestashop.log"
  exit 1
fi

echo "Deploy successful."
echo "Public URL: http://51.68.151.159/"
