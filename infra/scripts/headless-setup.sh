#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env

compose_cmd up -d mariadb redis prestashop >/dev/null

ps_cid="$(compose_cmd ps -q prestashop)"
db_cid="$(compose_cmd ps -q mariadb)"
if [[ -z "${ps_cid}" || -z "${db_cid}" ]]; then
  echo "Prestashop or MariaDB container is missing." >&2
  exit 1
fi

db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
ws_key="$(awk -F= '/^PS_WEBSERVICE_KEY=/{print $2}' "${ENV_FILE}")"
frontend_domain="$(awk -F= '/^FRONTEND_DOMAIN=/{print $2}' "${ENV_FILE}")"
admin_folder="$(awk -F= '/^PS_FOLDER_ADMIN=/{print $2}' "${ENV_FILE}")"

frontend_domain="${frontend_domain%/}"
admin_folder="${admin_folder:-admin}"

if [[ -z "${ws_key}" || -z "${frontend_domain}" ]]; then
  echo "PS_WEBSERVICE_KEY and FRONTEND_DOMAIN must be set in infra/.env." >&2
  exit 1
fi

run_sql() {
  local sql="$1"
  docker exec "${db_cid}" mariadb -uroot -p"${db_root}" "${db_name}" -Nse "${sql}"
}

wait_for_prestashop_tables() {
  local retries=90
  local delay=4
  local i
  for i in $(seq 1 "${retries}"); do
    if run_sql "SELECT 1 FROM information_schema.tables WHERE table_schema='${db_name}' AND table_name='ps_configuration' LIMIT 1;" | grep -q 1; then
      return 0
    fi
    sleep "${delay}"
  done

  echo "Timed out waiting for PrestaShop tables in DB '${db_name}'." >&2
  return 1
}

escape_sql() {
  printf "%s" "$1" | sed "s/'/''/g"
}

wait_for_prestashop_tables

echo "[headless] enable webservice key + permissions"
ws_key_escaped="$(escape_sql "${ws_key}")"
key_column="$(run_sql "SELECT column_name FROM information_schema.columns WHERE table_schema='${db_name}' AND table_name='ps_webservice_account' AND column_name IN ('key','key_value') ORDER BY field(column_name,'key_value','key') LIMIT 1;")"
if [[ -z "${key_column}" ]]; then
  echo "Unable to locate webservice key column in ps_webservice_account." >&2
  exit 1
fi

run_sql "INSERT INTO ps_webservice_account (${key_column}, description, class_name, is_module, module_name, active, deleted)
VALUES ('${ws_key_escaped}', 'ForestCatering Headless Key', 'WebserviceRequest', 0, '', 1, 0)
ON DUPLICATE KEY UPDATE active=1, deleted=0;"

ws_id="$(run_sql "SELECT id_webservice_account FROM ps_webservice_account WHERE ${key_column}='${ws_key_escaped}' LIMIT 1;")"
if [[ -z "${ws_id}" ]]; then
  echo "Unable to resolve created webservice account ID." >&2
  exit 1
fi

escaped_key="$(sql_escape "${ws_key}")"
ws_key_column="$(run_sql "SELECT COLUMN_NAME
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='${db_name}'
    AND TABLE_NAME='ps_webservice_account'
    AND COLUMN_NAME IN ('key_value', 'key')
  ORDER BY FIELD(COLUMN_NAME, 'key_value', 'key')
  LIMIT 1;")"
if [[ -z "${ws_key_column}" ]]; then
  echo "Nie znaleziono kolumny key_value/key w ps_webservice_account." >&2
  exit 1
fi

run_sql "INSERT INTO ps_webservice_account (\`${ws_key_column}\`, active, description, class_name, is_module, module_name)
  VALUES ('${escaped_key}', 1, 'Headless API (Next.js frontend)', '', 0, '')
  ON DUPLICATE KEY UPDATE active=1, description=VALUES(description);"
ws_id="$(run_sql "SELECT id_webservice_account FROM ps_webservice_account WHERE \`${ws_key_column}\`='${escaped_key}' LIMIT 1;")"
run_sql "INSERT IGNORE INTO ps_webservice_account_shop (id_webservice_account, id_shop)
SELECT ${ws_id}, id_shop FROM ps_shop;"

resources=(products categories images combinations customers carts orders order_details stock_availables carriers addresses countries)
for resource in "${resources[@]}"; do
  for method in GET POST PUT DELETE; do
    run_sql "INSERT IGNORE INTO ps_webservice_permission (id_webservice_account, resource, method)
    VALUES (${ws_id}, '${resource}', '${method}');"
  done
done

run_sql "UPDATE ps_configuration SET value='1' WHERE name='PS_WEBSERVICE';"

echo "[headless] normalize shop URL for localhost"
run_sql "UPDATE ps_shop_url SET domain='localhost', domain_ssl='localhost', physical_uri='/' WHERE main=1;"
run_sql "UPDATE ps_configuration SET value='localhost' WHERE name IN ('PS_SHOP_DOMAIN', 'PS_SHOP_DOMAIN_SSL');"
run_sql "UPDATE ps_configuration SET value='/' WHERE name='PS_BASE_URI';"

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

echo "[headless] done"
echo "  admin: http://127.0.0.1:8080/${admin_folder}/"
echo "  api:   http://127.0.0.1:8080/api/"
