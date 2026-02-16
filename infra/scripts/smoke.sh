#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env

runlog="$(run_dir)"

echo "[smoke] docker compose up -d --build"
compose_cmd up -d --build >"${runlog}/compose-up.log"

echo "[smoke] waiting for healthy services"
wait_for_container_health mariadb 240
wait_for_container_health redis 180
wait_for_container_health prestashop 360
wait_for_container_health frontend 240

presta_status="$(curl -sS -o "${runlog}/presta-api-body.txt" -w '%{http_code}' http://127.0.0.1:8080/api/ || true)"
next_status="$(curl -sS -o "${runlog}/next-home-body.txt" -w '%{http_code}' http://127.0.0.1:3000/ || true)"

echo "prestashop_api_status=${presta_status}" | tee "${runlog}/curl-status.txt"
echo "frontend_home_status=${next_status}" | tee -a "${runlog}/curl-status.txt"

if [[ ! "${presta_status}" =~ ^(200|401)$ ]]; then
  echo "PrestaShop API check failed with status ${presta_status}" >&2
  exit 1
fi

if [[ "${next_status}" != "200" ]]; then
  echo "Frontend check failed with status ${next_status}" >&2
  exit 1
fi

compose_cmd ps >"${runlog}/compose-ps.txt"
compose_cmd logs --no-color --tail=200 prestashop frontend >"${runlog}/compose-logs.txt"

echo "[smoke] PASS (logs: ${runlog})"
