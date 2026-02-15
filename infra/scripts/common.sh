#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
ARTIFACT_DIR="/home/forest/artifacts"

ensure_env() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    "${INFRA_DIR}/gen-secrets.sh"
  fi
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

run_dir() {
  local stamp
  stamp="$(date +%Y%m%d-%H%M%S)"
  local dir="${INFRA_DIR}/logs/run-${stamp}"
  mkdir -p "${dir}"
  printf '%s\n' "${dir}"
}
