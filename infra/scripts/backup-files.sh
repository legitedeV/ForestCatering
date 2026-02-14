#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BASE_DIR}/backups"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/prestashop-files-${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

docker run --rm \
  -v forestcatering-infra_prestashop_data:/source:ro \
  -v "${BACKUP_DIR}":/backup \
  alpine:3.20 \
  sh -c "tar -czf /backup/$(basename "${OUTPUT_FILE}") -C /source ."

echo "Created files backup: ${OUTPUT_FILE}"
