#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env
mkdir -p "${ARTIFACT_DIR}"
ts="$(date +%Y%m%d-%H%M%S)"
out="${ARTIFACT_DIR}/mariadb-${ts}.sql.gz"
compose_cmd exec -T mariadb sh -lc 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' | gzip -c > "${out}"
echo "${out}"
