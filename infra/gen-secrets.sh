#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
EXAMPLE_FILE="${SCRIPT_DIR}/.env.example"
FORCE="${1:-}"

if [[ ! -f "${EXAMPLE_FILE}" ]]; then
  echo "Missing ${EXAMPLE_FILE}" >&2
  exit 1
fi

if [[ -f "${ENV_FILE}" && "${FORCE}" != "--force" ]]; then
  echo "${ENV_FILE} already exists. Use --force to regenerate."
  exit 0
fi

ROOT_PASS="$(openssl rand -base64 36 | tr -d '\n' | tr '/+' 'AB' | cut -c1-40)"
APP_PASS="$(openssl rand -base64 30 | tr -d '\n' | tr '/+' 'CD' | cut -c1-34)"
DEFAULT_MIRROR_BASE_URL="http://51.68.151.159/mirror/forestcatering-infra"

cat > "${ENV_FILE}" <<EOT
TZ=Europe/Warsaw

MARIADB_ROOT_PASSWORD=${ROOT_PASS}
MARIADB_DATABASE=forestcatering_app
MARIADB_USER=forestcatering
MARIADB_PASSWORD=${APP_PASS}

BACKUP_RETENTION_DAYS=14
EOT

chmod 600 "${ENV_FILE}"
echo "Generated ${ENV_FILE} with fresh secrets (600 permissions)."
