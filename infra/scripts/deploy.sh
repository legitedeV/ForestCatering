#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "${BASE_DIR}/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
COMPOSE_FILE="${BASE_DIR}/compose.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not installed in PATH" >&2
  exit 1
fi

echo "[1/3] Updating repository (git pull --ff-only)..."
git -C "${REPO_DIR}" pull --ff-only

echo "[2/3] Pulling updated container base images..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" pull

echo "[3/3] Recreating services with updated base images..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --force-recreate --remove-orphans

echo "Deployment complete."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
