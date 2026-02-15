#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env
file="${1:-}"
if [[ -z "${file}" || ! -f "${file}" ]]; then
  echo "Usage: $0 /path/to/backup.sql.gz" >&2
  exit 1
fi
gzip -dc "${file}" | compose_cmd exec -T mariadb sh -lc 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"'
