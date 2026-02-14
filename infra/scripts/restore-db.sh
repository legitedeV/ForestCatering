#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-file.sql.gz>" >&2
  exit 1
fi

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
BACKUP_FILE="$1"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

source "${ENV_FILE}"

echo "Restoring ${BACKUP_FILE} into mariadb service..."
gunzip -c "${BACKUP_FILE}" | docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T mariadb \
  sh -lc 'mysql -uroot -p"$MARIADB_ROOT_PASSWORD"'

echo "Restore complete."
