#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env
mkdir -p "${INFRA_DIR}/logs"

stamp="$(date +%Y%m%d-%H%M%S)"
log_file="${INFRA_DIR}/logs/headless-setup-${stamp}.log"
mirror_dir="/var/www/mirror/forestcatering"
mirror_log="${mirror_dir}/headless-setup-last.log"

exec > >(tee -a "${log_file}") 2>&1

echo "[headless] start ${stamp}"
echo "[headless] compose up -d mariadb redis prestashop"
compose_cmd up -d mariadb redis prestashop >/dev/null

wait_for_container_health mariadb 300
wait_for_container_health prestashop 300

ps_cid="$(compose_cmd ps -q prestashop)"
db_cid="$(compose_cmd ps -q mariadb)"
if [[ -z "${ps_cid}" || -z "${db_cid}" ]]; then
  echo "Prestashop or MariaDB container is missing." >&2
  exit 1
fi

db_name="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_DATABASE"')"
db_root="$(docker exec "${db_cid}" sh -lc 'printf %s "$MARIADB_ROOT_PASSWORD"')"
ws_key="$(docker exec "${ps_cid}" sh -lc 'printf %s "$PS_WEBSERVICE_KEY"')"
frontend_domain="$(docker exec "${ps_cid}" sh -lc 'printf %s "$FRONTEND_DOMAIN"')"
admin_folder="$(docker exec "${ps_cid}" sh -lc 'printf %s "$PS_FOLDER_ADMIN"')"
frontend_domain="${frontend_domain%/}"
admin_folder="${admin_folder:-admin}"

if [[ -z "${db_name}" || -z "${db_root}" || -z "${ws_key}" || -z "${frontend_domain}" ]]; then
  echo "Missing required runtime environment values in containers." >&2
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
  echo "Timed out waiting for MariaDB SQL endpoint." >&2
  return 1
}

wait_for_prestashop_http() {
  local retries=90
  local delay=3
  local i
  local code
  for i in $(seq 1 "${retries}"); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/ || true)"
    if [[ "${code}" =~ ^(200|301|302)$ ]]; then
      return 0
    fi
    sleep "${delay}"
  done
  echo "Timed out waiting for PrestaShop HTTP endpoint." >&2
  return 1
}

wait_for_ps_tables() {
  local retries=90
  local delay=3
  local i
  for i in $(seq 1 "${retries}"); do
    local webservice_table
    webservice_table="$(run_sql "SELECT table_name FROM information_schema.tables WHERE table_schema='${db_name}' AND table_name LIKE '%webservice_account' ORDER BY (table_name='ps_webservice_account') DESC, table_name LIMIT 1;")"
    if [[ -n "${webservice_table}" ]]; then
      return 0
    fi
    sleep "${delay}"
  done
  echo "Timed out waiting for PrestaShop tables in DB '${db_name}'." >&2
  return 1
}

wait_for_sql
wait_for_prestashop_http
wait_for_ps_tables

webservice_table="$(run_sql "SELECT table_name FROM information_schema.tables WHERE table_schema='${db_name}' AND table_name LIKE '%webservice_account' ORDER BY (table_name='ps_webservice_account') DESC, table_name LIMIT 1;")"
if [[ -z "${webservice_table}" ]]; then
  echo "Unable to resolve webservice_account table." >&2
  exit 1
fi
pfx="${webservice_table%webservice_account}"
if [[ -z "${pfx}" ]]; then
  echo "Unable to infer PrestaShop DB prefix from table '${webservice_table}'." >&2
  exit 1
fi

echo "[headless] detected DB prefix: ${pfx}"

has_deleted="$(run_sql "SHOW COLUMNS FROM ${pfx}webservice_account LIKE 'deleted';")"
has_key="$(run_sql "SHOW COLUMNS FROM ${pfx}webservice_account LIKE 'key';")"
if [[ -n "${has_key}" ]]; then
  key_column='`key`'
else
  key_column='`key_value`'
fi

escaped_key="$(sql_escape "${ws_key}")"
escaped_description="$(sql_escape "ForestCatering Headless Key")"

insert_columns="${key_column}, `description`, `class_name`, `is_module`, `module_name`, `active`"
insert_values="'${escaped_key}', '${escaped_description}', 'WebserviceRequest', 0, '', 1"
update_clause='`active`=1, `description`=VALUES(`description`)'

if [[ -n "${has_deleted}" ]]; then
  insert_columns+=", `deleted`"
  insert_values+=", 0"
  update_clause+=", `deleted`=0"
fi

run_sql "INSERT INTO ${pfx}webservice_account (${insert_columns}) VALUES (${insert_values}) ON DUPLICATE KEY UPDATE ${update_clause};"

ws_id="$(run_sql "SELECT id_webservice_account FROM ${pfx}webservice_account WHERE ${key_column}='${escaped_key}' LIMIT 1;")"
if [[ -z "${ws_id}" ]]; then
  echo "Unable to resolve created webservice account ID." >&2
  exit 1
fi

run_sql "INSERT IGNORE INTO ${pfx}webservice_account_shop (id_webservice_account, id_shop) SELECT ${ws_id}, id_shop FROM ${pfx}shop;"

resources=(products categories images combinations customers carts orders order_details stock_availables carriers addresses countries specific_prices product_features product_feature_values product_customization_fields customizations manufacturers suppliers taxes)
for resource in "${resources[@]}"; do
  for method in GET POST PUT DELETE; do
    run_sql "INSERT IGNORE INTO ${pfx}webservice_permission (id_webservice_account, resource, method) VALUES (${ws_id}, '$(sql_escape "${resource}")', '${method}');"
  done
done

run_sql "UPDATE ${pfx}configuration SET value='1' WHERE name='PS_WEBSERVICE';"
run_sql "UPDATE ${pfx}shop_url SET domain='localhost', domain_ssl='localhost', physical_uri='/' WHERE main=1;"
run_sql "UPDATE ${pfx}configuration SET value='localhost' WHERE name IN ('PS_SHOP_DOMAIN', 'PS_SHOP_DOMAIN_SSL');"
run_sql "UPDATE ${pfx}configuration SET value='/' WHERE name='PS_BASE_URI';"

echo "[headless] install headless rewrite/CORS block"
docker exec "${ps_cid}" sh -lc "cat > /var/www/html/headless-api-only.json <<'JSON'
{\"error\":\"Use headless frontend\",\"frontend\":\"${frontend_domain}\",\"api\":\"/api\"}
JSON"

docker exec "${ps_cid}" sh -lc "
set -eu
ht=/var/www/html/.htaccess
tmp=\"\${ht}.tmp\"
touch \"\${ht}\"
sed '/# BEGIN FORESTCATERING_HEADLESS/,/# END FORESTCATERING_HEADLESS/d' \"\${ht}\" > \"\${tmp}\"
cat >> \"\${tmp}\" <<'BLOCK'
# BEGIN FORESTCATERING_HEADLESS
<IfModule mod_headers.c>
  SetEnvIf Request_URI \"^/(api|webservice)(/|$)\" FC_API=1
  Header always set Access-Control-Allow-Origin \"${frontend_domain}\" env=FC_API
  Header always set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" env=FC_API
  Header always set Access-Control-Allow-Headers \"Authorization, Content-Type, Io-Format, Output-Format\" env=FC_API
  Header always set Access-Control-Max-Age \"86400\" env=FC_API
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On

  RewriteCond %{REQUEST_METHOD} =OPTIONS
  RewriteCond %{REQUEST_URI} ^/(api|webservice)(/|$) [NC]
  RewriteRule ^ - [R=204,L]

  RewriteCond %{REQUEST_URI} !^/${admin_folder}(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/api(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/webservice(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/module/[^/]+/payment [NC]
  RewriteCond %{REQUEST_URI} !^/headless-api-only\\.json$ [NC]
  RewriteCond %{HTTP:Accept} application/json [NC]
  RewriteRule ^ /headless-api-only.json [L]

  RewriteCond %{REQUEST_URI} !^/${admin_folder}(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/api(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/webservice(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/module/[^/]+/payment [NC]
  RewriteCond %{REQUEST_URI} !^/headless-api-only\\.json$ [NC]
  RewriteRule ^ ${frontend_domain}%{REQUEST_URI} [R=301,L]
</IfModule>
# END FORESTCATERING_HEADLESS
BLOCK
mv \"\${tmp}\" \"\${ht}\"
"

docker exec "${ps_cid}" apache2ctl -k graceful >/dev/null 2>&1 || true
if docker exec "${ps_cid}" test -f /var/www/html/bin/console; then
  docker exec "${ps_cid}" php /var/www/html/bin/console cache:clear --no-warmup --env=prod >/dev/null 2>&1 || true
fi

active_value="$(run_sql "SELECT active FROM ${pfx}webservice_account WHERE ${key_column}='${escaped_key}' LIMIT 1;")"
http_code="$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/ || true)"
if [[ ! "${http_code}" =~ ^(200|302)$ ]]; then
  echo "Smoke failed: GET / returned HTTP ${http_code}, expected 200/302" >&2
  exit 1
fi
if [[ "${active_value}" != "1" ]]; then
  echo "Smoke failed: webservice key row exists but active=${active_value}" >&2
  exit 1
fi

echo "[headless] webservice_key=${ws_key}"
echo "[headless] verification: id_webservice_account=${ws_id} active=${active_value}"
echo "[headless] smoke: GET / -> HTTP ${http_code}"
echo "[headless] log: ${log_file}"

mkdir -p "${mirror_dir}"
redacted_log="$(mktemp)"
cp "${log_file}" "${redacted_log}"
for secret in "${db_root}" "${ws_key}"; do
  if [[ -n "${secret}" ]]; then
    escaped_secret="$(printf '%s' "${secret}" | sed -e 's/[.[\*^$()+?{}|\\]/\\&/g')"
    sed -i "s/${escaped_secret}/[REDACTED]/g" "${redacted_log}"
  fi
done
cp "${redacted_log}" "${mirror_log}"
rm -f "${redacted_log}"
echo "[headless] mirror log: ${mirror_log}"
