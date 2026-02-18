#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env
mkdir -p "${INFRA_DIR}/logs"

stamp="$(date +%Y%m%d-%H%M%S)"
log_file="${INFRA_DIR}/logs/fix-shop-domain-${stamp}.log"
mirror_dir="/home/forest/mirror/forestcatering"
mirror_log="${mirror_dir}/fix-shop-domain-last.log"

exec > >(tee -a "${log_file}") 2>&1

resolve_target_host() {
  if [[ -n "${TARGET_HOST:-}" ]]; then
    printf '%s\n' "${TARGET_HOST}"
    return 0
  fi

  if [[ -f "${ENV_FILE}" ]]; then
    local env_target
    env_target="$(awk -F= '/^TARGET_HOST=/{print $2}' "${ENV_FILE}" | tail -n1 | tr -d '"' | xargs || true)"
    if [[ -n "${env_target}" ]]; then
      printf '%s\n' "${env_target}"
      return 0
    fi

    local env_ps_domain
    env_ps_domain="$(awk -F= '/^PS_DOMAIN=/{print $2}' "${ENV_FILE}" | tail -n1 | tr -d '"' | xargs || true)"
    if [[ -n "${env_ps_domain}" && "${env_ps_domain}" != "localhost" && "${env_ps_domain}" != "127.0.0.1" ]]; then
      printf '%s\n' "${env_ps_domain}"
      return 0
    fi
  fi

  local ps_cid detected_from_container
  ps_cid="$(compose_cmd ps -q prestashop || true)"
  if [[ -n "${ps_cid}" ]]; then
    detected_from_container="$(docker exec "${ps_cid}" sh -lc 'printf %s "${PS_DOMAIN:-}"' | tr -d '\r\n' || true)"
    if [[ -n "${detected_from_container}" && "${detected_from_container}" != "localhost" && "${detected_from_container}" != "127.0.0.1" ]]; then
      printf '%s\n' "${detected_from_container}"
      return 0
    fi
  fi

  printf '%s\n' "51.68.151.159"
}

echo "[fix-shop-domain] start ${stamp}"

db_cid="$(compose_cmd ps -q mariadb)"
ps_cid="$(compose_cmd ps -q prestashop)"
if [[ -z "${db_cid}" || -z "${ps_cid}" ]]; then
  echo "[fix-shop-domain] required containers are missing" >&2
  exit 1
fi

wait_for_container_health mariadb 300
wait_for_container_health prestashop 300

db_name="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_DATABASE"')"
db_root="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_ROOT_PASSWORD"')"

if [[ -z "${db_name}" || -z "${db_root}" ]]; then
  echo "[fix-shop-domain] missing DB runtime values" >&2
  exit 1
fi

run_sql() {
  local sql="$1"
  docker exec "${db_cid}" mariadb -uroot -p"${db_root}" "${db_name}" -Nse "${sql}"
}

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

wait_for_sql() {
  local retries=90
  local delay=3
  local i
  for i in $(seq 1 "${retries}"); do
    if run_sql "SELECT 1;" >/dev/null 2>&1; then
      return 0
    fi
    sleep "${delay}"
  done
  echo "[fix-shop-domain] timed out waiting for SQL" >&2
  return 1
}

wait_for_sql

detected_prefix="$(run_sql "SELECT SUBSTRING_INDEX(table_name,'configuration',1) FROM information_schema.tables WHERE table_schema='${db_name}' AND table_name LIKE '%configuration' ORDER BY (table_name='ps_configuration') DESC, table_name LIMIT 1;" | tr -d '\r\n')"
if [[ -z "${detected_prefix}" ]]; then
  detected_prefix="ps_"
fi

if run_sql "SELECT 1 FROM information_schema.columns WHERE table_schema='${db_name}' AND table_name='${detected_prefix}configuration' AND column_name='name' LIMIT 1;" | grep -q '1'; then
  conf_prefix="$(run_sql "SELECT value FROM ${detected_prefix}configuration WHERE name='PS_DB_PREFIX' LIMIT 1;" | tr -d '\r\n' || true)"
  if [[ -n "${conf_prefix}" ]]; then
    detected_prefix="${conf_prefix}"
  fi
fi

target_host="$(resolve_target_host)"
escaped_host="$(sql_escape "${target_host}")"

echo "[fix-shop-domain] DB=${db_name} prefix=${detected_prefix} target_host=${target_host}"

run_sql "UPDATE ${detected_prefix}configuration SET value='${escaped_host}' WHERE name IN ('PS_SHOP_DOMAIN','PS_SHOP_DOMAIN_SSL');"
run_sql "UPDATE ${detected_prefix}configuration SET value='0' WHERE name IN ('PS_SSL_ENABLED','PS_SSL_ENABLED_EVERYWHERE');"
run_sql "UPDATE ${detected_prefix}configuration SET value='/' WHERE name='PS_BASE_URI';"

run_sql "UPDATE ${detected_prefix}shop_url SET domain='${escaped_host}', domain_ssl='${escaped_host}', physical_uri='/' WHERE 1;"

rm -rf /var/www/html/var/cache/* || true
if docker exec "${ps_cid}" test -d /var/www/html/var/cache; then
  docker exec "${ps_cid}" sh -lc 'rm -rf /var/www/html/var/cache/*' || true
fi

raw_headers_local="$(curl -sS -D- -o /dev/null http://127.0.0.1/ | sed -n '1,20p' || true)"
raw_headers_host="$(curl -sS -H "Host: ${target_host}" -D- -o /dev/null http://127.0.0.1/ | sed -n '1,20p' || true)"

echo "[fix-shop-domain] curl http://127.0.0.1/"
printf '%s\n' "${raw_headers_local}"

echo "[fix-shop-domain] curl Host=${target_host} http://127.0.0.1/"
printf '%s\n' "${raw_headers_host}"

if printf '%s\n%s\n' "${raw_headers_local}" "${raw_headers_host}" | grep -qi 'Location: http://localhost/'; then
  echo "[fix-shop-domain] ERROR: localhost redirect still present" >&2
  exit 1
fi

mkdir -p "${mirror_dir}"
cp "${log_file}" "${mirror_log}"
echo "[fix-shop-domain] mirror log: ${mirror_log}"
echo "[fix-shop-domain] log: ${log_file}"
echo "[fix-shop-domain] done"
