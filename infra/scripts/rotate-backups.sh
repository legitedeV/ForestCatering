#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
BACKUP_DIR="${BASE_DIR}/backups"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi

source "${ENV_FILE}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
mkdir -p "${BACKUP_DIR}"

mapfile -t FILES < <(find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'mariadb-backup-*.sql.gz' | sort)
if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No backups found in ${BACKUP_DIR}."
  exit 0
fi

declare -A BEST_FOR_DAY=()
for file in "${FILES[@]}"; do
  base="$(basename "${file}")"
  day="${base#mariadb-backup-}"
  day="${day%%-*}"
  if [[ -z "${BEST_FOR_DAY[${day}]:-}" || "${file}" > "${BEST_FOR_DAY[${day}]}" ]]; then
    BEST_FOR_DAY["${day}"]="${file}"
  fi
done

mapfile -t DAYS_SORTED < <(printf '%s\n' "${!BEST_FOR_DAY[@]}" | sort -r)

keep_days=()
for day in "${DAYS_SORTED[@]}"; do
  if [[ ${#keep_days[@]} -lt ${RETENTION_DAYS} ]]; then
    keep_days+=("${day}")
  fi
done

declare -A KEEP_SET=()
for day in "${keep_days[@]}"; do
  KEEP_SET["${BEST_FOR_DAY[${day}]}"]=1
done

for file in "${FILES[@]}"; do
  if [[ -z "${KEEP_SET[${file}]:-}" ]]; then
    rm -f "${file}"
    echo "Removed old backup: ${file}"
  fi
done

echo "Backup rotation done. Retained daily snapshots: ${#keep_days[@]}"
