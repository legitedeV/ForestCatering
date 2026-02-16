#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

rand_hex() {
  openssl rand -hex "$1"
}

rand_admin_password() {
  tr -dc 'A-Za-z0-9@#%+=' </dev/urandom | head -c 28
}

upsert_env() {
  local key="$1"
  local value="$2"
  local current

  current="$(awk -F= -v k="${key}" '$1==k{print substr($0,index($0,"=")+1)}' "${ENV_FILE}" | tail -n1)"

  if [[ -z "${current}" ]] || [[ "${current}" =~ ^replace_with_ ]] || [[ "${current}" == "admin@example.invalid" ]] || [[ "${current}" == "replace_with_32_char_hex_key" ]]; then
    if grep -qE "^${key}=" "${ENV_FILE}"; then
      sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    else
      printf '%s=%s\n' "${key}" "${value}" >>"${ENV_FILE}"
    fi
  fi
}

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${SCRIPT_DIR}/.env.example" "${ENV_FILE}"
  echo "Created ${ENV_FILE} from .env.example"
fi

upsert_env "MARIADB_ROOT_PASSWORD" "$(rand_hex 24)"
upsert_env "MARIADB_DATABASE" "forestcatering_app"
upsert_env "MARIADB_USER" "forestcatering"
upsert_env "MARIADB_PASSWORD" "$(rand_hex 20)"
upsert_env "PRESTASHOP_ADMIN_EMAIL" "admin@localhost"
upsert_env "PRESTASHOP_ADMIN_PASSWORD" "$(rand_admin_password)"
upsert_env "PS_FOLDER_ADMIN" "admin-$(rand_hex 4)"
upsert_env "PS_FOLDER_INSTALL" "install-$(rand_hex 4)"
upsert_env "PS_ERASE_DB" "0"
upsert_env "PS_DOMAIN" "localhost"
upsert_env "FRONTEND_DOMAIN" "http://127.0.0.1:3000"
upsert_env "PS_WEBSERVICE_KEY" "$(rand_hex 16)"

chmod 600 "${ENV_FILE}" || true

echo "Secrets ensured in ${ENV_FILE}"
