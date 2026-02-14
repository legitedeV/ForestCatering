#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
BACKUP_DIR="${BASE_DIR}/backups"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/mariadb-backup-${TIMESTAMP}.sql.gz"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
source "${ENV_FILE}"

TMP_FILE="${BACKUP_DIR}/.mariadb-backup-${TIMESTAMP}.sql"
trap 'rm -f "${TMP_FILE}"' EXIT

docker compose -f "${BASE_DIR}/compose.yml" --env-file "${ENV_FILE}" exec -T mariadb \
  sh -lc 'mysqldump -uroot -p"$MARIADB_ROOT_PASSWORD" --all-databases --single-transaction --quick --routines --events' > "${TMP_FILE}"

gzip -c "${TMP_FILE}" > "${OUTPUT_FILE}"
rm -f "${TMP_FILE}"
trap - EXIT

echo "Created backup: ${OUTPUT_FILE}"
