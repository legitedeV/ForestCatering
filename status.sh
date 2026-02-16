#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="${BASE_DIR}/infra"

if [[ ! -d "${INFRA_DIR}" ]]; then
  echo '{"error":"infra directory not found"}'
  exit 1
fi

cd "${INFRA_DIR}"

get_cid() {
  docker compose ps -q "$1" 2>/dev/null || true
}

get_state() {
  local CID="$1"
  if [[ -z "$CID" ]]; then
    echo "not_running"
    return
  fi
  docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CID" 2>/dev/null || echo "unknown"
}

PRESTASHOP_CID="$(get_cid prestashop)"
MARIADB_CID="$(get_cid mariadb)"
REDIS_CID="$(get_cid redis)"

PRESTASHOP_STATUS="$(get_state "$PRESTASHOP_CID")"
MARIADB_STATUS="$(get_state "$MARIADB_CID")"
REDIS_STATUS="$(get_state "$REDIS_CID")"

HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ || echo "000")"

COMMIT="$(git -C "${BASE_DIR}" rev-parse --short HEAD 2>/dev/null || echo "unknown")"

cat <<EOF
{
  "commit": "${COMMIT}",
  "prestashop": "${PRESTASHOP_STATUS}",
  "mariadb": "${MARIADB_STATUS}",
  "redis": "${REDIS_STATUS}",
  "http_code": "${HTTP_CODE}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
