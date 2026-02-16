#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"

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

wait_for_container_health() {
  local service="$1"
  local timeout_seconds="${2:-240}"
  local start
  start="$(date +%s)"

  while true; do
    local cid status
    cid="$(compose_cmd ps -q "${service}")"
    if [[ -n "${cid}" ]]; then
      status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${cid}" 2>/dev/null || true)"
      if [[ "${status}" == "healthy" ]] || [[ "${status}" == "running" ]]; then
        return 0
      fi
    fi

    if (( $(date +%s) - start > timeout_seconds )); then
      echo "Timed out waiting for service '${service}' to be healthy." >&2
      return 1
    fi

    sleep 3
  done
}
