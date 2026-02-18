#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env
mkdir -p "${INFRA_DIR}/logs"

stamp="$(date +%Y%m%d-%H%M%S)"
log_file="${INFRA_DIR}/logs/smoke-headless-${stamp}.log"
exec > >(tee -a "${log_file}") 2>&1

echo "[smoke-headless] start ${stamp}"
"${SCRIPT_DIR}/headless-setup.sh"

db_cid="$(compose_cmd ps -q mariadb)"
ps_cid="$(compose_cmd ps -q prestashop)"
if [[ -z "${db_cid}" || -z "${ps_cid}" ]]; then
  echo "[smoke-headless] containers missing" >&2
  exit 1
fi

db_name="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_DATABASE"')"
db_root="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_ROOT_PASSWORD"')"
ws_key="$(docker exec "${ps_cid}" sh -lc 'printf %s "$PS_WEBSERVICE_KEY"')"

run_sql() {
  local sql="$1"
  docker exec "${db_cid}" mariadb -uroot -p"${db_root}" "${db_name}" -Nse "${sql}"
}

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

webservice_table="$(run_sql "SELECT table_name FROM information_schema.tables WHERE table_schema='${db_name}' AND table_name LIKE '%webservice_account' ORDER BY (table_name='ps_webservice_account') DESC, table_name LIMIT 1;")"
pfx="${webservice_table%webservice_account}"

has_key="$(run_sql "SHOW COLUMNS FROM ${pfx}webservice_account LIKE 'key';")"
if [[ -n "${has_key}" ]]; then
  key_column='`key`'
else
  key_column='`key_value`'
fi

escaped_key="$(sql_escape "${ws_key}")"
row_exists="$(run_sql "SELECT COUNT(*) FROM ${pfx}webservice_account WHERE ${key_column}='${escaped_key}' AND active=1;")"
if [[ "${row_exists}" -lt 1 ]]; then
  echo "[smoke-headless] DB verification failed: active webservice row not found" >&2
  exit 1
fi

http_code="$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/ || true)"
if [[ ! "${http_code}" =~ ^(200|302)$ ]]; then
  echo "[smoke-headless] HTTP verification failed: expected 200/302, got ${http_code}" >&2
  exit 1
fi

echo "[smoke-headless] DB verification: active row count=${row_exists}"
echo "[smoke-headless] HTTP verification: GET / -> ${http_code}"
echo "[smoke-headless] PASS"
echo "[smoke-headless] log: ${log_file}"
