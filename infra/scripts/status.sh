#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi

docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" ps
