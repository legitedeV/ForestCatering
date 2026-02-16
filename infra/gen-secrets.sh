#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

rand_hex() { openssl rand -hex "$1"; }
rand_b64() { openssl rand -base64 "$1" | tr -d '\n' | tr '/+' 'ab' | cut -c1-24; }

local_ip=""
if command -v ip >/dev/null 2>&1; then
  local_ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++){if($i=="src"){print $(i+1); exit}}}' || true)"
fi
if [[ -z "${local_ip}" ]]; then
  local_ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
fi
if [[ -z "${local_ip}" ]]; then
  local_ip="$(curl -fsS --max-time 5 ifconfig.me 2>/dev/null || true)"
fi
if [[ -z "${local_ip}" ]]; then
  echo "Unable to detect SERVER_IP" >&2
  exit 1
fi

if [[ -f "${ENV_FILE}" ]]; then
  echo "${ENV_FILE} already exists. Reusing existing secrets."
  exit 0
fi

cat > "${ENV_FILE}" <<EOT
MARIADB_ROOT_PASSWORD=$(rand_hex 24)
MARIADB_DATABASE=forestcatering_app
MARIADB_USER=forestcatering
MARIADB_PASSWORD=$(rand_hex 20)
PRESTASHOP_ADMIN_EMAIL=admin@forestcatering.pl
PRESTASHOP_ADMIN_PASSWORD=$(rand_b64 32)A9!
SERVER_IP=${local_ip}
PS_FOLDER_ADMIN=admin-$(rand_hex 4)
PS_FOLDER_INSTALL=install-$(rand_hex 4)
PRESTASHOP_IMAGE=prestashop/prestashop:9-apache
PRESTASHOP_IMAGE_DIGEST=
PS_ERASE_DB=0
FRONTEND_DOMAIN=https://frontend-domain.pl
PS_WEBSERVICE_KEY=$(rand_hex 16)
EOT
chmod 600 "${ENV_FILE}"
echo "Generated ${ENV_FILE}"
