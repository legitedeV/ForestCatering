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
PS_ADMIN_PASS="$(openssl rand -base64 36 | tr -d '\n' | tr '/+' 'EF' | cut -c1-40)"

DEFAULT_SERVER_IP="$(hostname -I | awk '{print $1}')"
if [[ -f "${ENV_FILE}" ]]; then
  EXISTING_SERVER_IP="$(awk -F= '/^SERVER_IP=/{print $2}' "${ENV_FILE}" | tail -n1)"
else
  EXISTING_SERVER_IP=""
fi
SERVER_IP_VALUE="${EXISTING_SERVER_IP:-${DEFAULT_SERVER_IP:-51.68.151.159}}"

cat > "${ENV_FILE}" <<EOT
TZ=Europe/Warsaw

SERVER_IP=${SERVER_IP_VALUE}

MARIADB_ROOT_PASSWORD=${ROOT_PASS}
MARIADB_DATABASE=forestcatering_app
MARIADB_USER=forestcatering
MARIADB_PASSWORD=${APP_PASS}

PRESTASHOP_ADMIN_EMAIL=admin@forestcatering.local
PRESTASHOP_ADMIN_PASSWORD=${PS_ADMIN_PASS}
PRESTASHOP_INSTALL_AUTO=1

BACKUP_RETENTION_DAYS=14
EOT

chmod 600 "${ENV_FILE}"
echo "Generated ${ENV_FILE} with fresh secrets (600 permissions)."
