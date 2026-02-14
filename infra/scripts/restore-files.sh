#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-file.tar.gz>" >&2
  exit 1
fi

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_FILE="$1"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

docker run --rm \
  -v forestcatering-infra_prestashop_data:/target \
  -v "$(cd "$(dirname "${BACKUP_FILE}")" && pwd)":/backup:ro \
  alpine:3.20 \
  sh -c "rm -rf /target/* /target/.[!.]* /target/..?* && tar -xzf /backup/$(basename "${BACKUP_FILE}") -C /target"

echo "Restored files backup into prestashop_data from: ${BACKUP_FILE}"
