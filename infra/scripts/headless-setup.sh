#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

compose_cmd up -d mariadb redis prestashop >/dev/null

ps_cid="$(compose_cmd ps -q prestashop)"
db_cid="$(compose_cmd ps -q mariadb)"
if [[ -z "${ps_cid}" || -z "${db_cid}" ]]; then
  echo "Kontenery prestashop/mariadb nie są dostępne." >&2
  exit 1
fi

db_name="$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")"
db_root="$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")"
ws_key="$(awk -F= '/^PS_WEBSERVICE_KEY=/{print $2}' "${ENV_FILE}")"
frontend_domain="$(awk -F= '/^FRONTEND_DOMAIN=/{print $2}' "${ENV_FILE}")"
frontend_domain="${frontend_domain%/}"

if [[ -z "${ws_key}" ]]; then
  echo "PS_WEBSERVICE_KEY jest pusty w .env. Wygeneruj klucz (np. openssl rand -hex 16)." >&2
  exit 1
fi
if [[ -z "${frontend_domain}" ]]; then
  echo "FRONTEND_DOMAIN jest pusty w .env." >&2
  exit 1
fi
if [[ ! "${frontend_domain}" =~ ^https?://([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*(:[0-9]{1,5})?(/.*)?$ ]]; then
  echo "FRONTEND_DOMAIN ma niepoprawny format URL: ${frontend_domain}" >&2
  exit 1
fi

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

run_sql() {
  docker exec "${db_cid}" mariadb -N -uroot -p"${db_root}" "${db_name}" -e "$1"
}

for _ in {1..60}; do
  if [[ -n "$(run_sql "SHOW TABLES LIKE 'ps_configuration';" 2>/dev/null)" ]]; then
    break
  fi
  sleep 3
done

echo "── 1/4 Konfiguracja Webservice API ──"
run_sql "UPDATE ps_configuration SET value='1' WHERE name='PS_WEBSERVICE_CGI_HOST' OR name='PS_WEBSERVICE';"
run_sql "INSERT IGNORE INTO ps_configuration (name, value, date_add, date_upd) VALUES ('PS_WEBSERVICE', '1', NOW(), NOW());"
run_sql "INSERT IGNORE INTO ps_configuration (name, value, date_add, date_upd) VALUES ('PS_WEBSERVICE_CGI_HOST', '1', NOW(), NOW());"

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

has_class_name="$(run_sql "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${db_name}' AND TABLE_NAME='ps_webservice_account' AND COLUMN_NAME='class_name';")"
has_is_module="$(run_sql "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${db_name}' AND TABLE_NAME='ps_webservice_account' AND COLUMN_NAME='is_module';")"
has_module_name="$(run_sql "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${db_name}' AND TABLE_NAME='ps_webservice_account' AND COLUMN_NAME='module_name';")"
has_deleted="$(run_sql "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${db_name}' AND TABLE_NAME='ps_webservice_account' AND COLUMN_NAME='deleted';")"

insert_columns="\`${ws_key_column}\`, active, description"
insert_values="'${escaped_key}', 1, 'Headless API (Next.js frontend)'"
update_clause="active=1, description=VALUES(description)"

if [[ "${has_class_name}" == "1" ]]; then
  insert_columns+=" , class_name"
  insert_values+=" , 'WebserviceRequest'"
fi
if [[ "${has_is_module}" == "1" ]]; then
  insert_columns+=" , is_module"
  insert_values+=" , 0"
fi
if [[ "${has_module_name}" == "1" ]]; then
  insert_columns+=" , module_name"
  insert_values+=" , ''"
fi
if [[ "${has_deleted}" == "1" ]]; then
  insert_columns+=" , deleted"
  insert_values+=" , 0"
  update_clause+=" , deleted=0"
fi

run_sql "INSERT INTO ps_webservice_account (${insert_columns})
  VALUES (${insert_values})
  ON DUPLICATE KEY UPDATE ${update_clause};"
ws_id="$(run_sql "SELECT id_webservice_account FROM ps_webservice_account WHERE \`${ws_key_column}\`='${escaped_key}' LIMIT 1;")"
run_sql "INSERT IGNORE INTO ps_webservice_account_shop (id_webservice_account, id_shop)
  SELECT ${ws_id}, id_shop FROM ps_shop;"

resources=(
  products categories combinations customers carts orders order_details
  stock_availables carriers addresses countries specific_prices customizations product_features
)
for res in "${resources[@]}"; do
  for method in GET POST PUT DELETE; do
    run_sql "INSERT IGNORE INTO ps_webservice_permission (id_webservice_account, resource, method)
      VALUES (${ws_id}, '${res}', '${method}');"
  done
done
echo "  Klucz API aktywny: id=${ws_id}"

echo "── 2/4 Przekierowanie front-office ──"
docker exec "${ps_cid}" sh -lc "cat > /var/www/html/headless-api-only.json <<'JSON'
{\"error\":\"Use API\",\"api_url\":\"/api\"}
JSON"

docker exec "${ps_cid}" sh -lc "ht=/var/www/html/.htaccess; \
  touch \"\$ht\"; \
  sed '/# BEGIN FORESTCATERING_HEADLESS/,/# END FORESTCATERING_HEADLESS/d' \"\$ht\" > \"\${ht}.tmp\"; \
  cat >> \"\${ht}.tmp\" <<BLOCK
# BEGIN FORESTCATERING_HEADLESS
<IfModule mod_headers.c>
  SetEnvIf Request_URI \"^/(api|webservice)(/|$)\" IS_API=1
  Header always set Access-Control-Allow-Origin \"${frontend_domain}\" env=IS_API
  Header always set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" env=IS_API
  Header always set Access-Control-Allow-Headers \"Content-Type, Authorization, Io-Format, Output-Format\" env=IS_API
  Header always set Access-Control-Max-Age \"86400\" env=IS_API
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_METHOD} OPTIONS
  RewriteCond %{REQUEST_URI} ^/(api|webservice)(/|$) [NC]
  RewriteRule ^ - [R=204,L]

  RewriteCond %{REQUEST_URI} !^/admin [NC]
  RewriteCond %{REQUEST_URI} !^/api(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/webservice(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/module/[^/]+/payment [NC]
  RewriteCond %{REQUEST_URI} !^/headless-api-only\\.json$ [NC]
  RewriteCond %{HTTP:Accept} application/json [NC]
  RewriteRule ^ /headless-api-only.json [L]

  RewriteCond %{REQUEST_URI} !^/admin [NC]
  RewriteCond %{REQUEST_URI} !^/api(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/webservice(/|$) [NC]
  RewriteCond %{REQUEST_URI} !^/module/[^/]+/payment [NC]
  RewriteCond %{REQUEST_URI} !^/headless-api-only\\.json$ [NC]
  RewriteRule ^ ${frontend_domain}%{REQUEST_URI} [R=301,L]
</IfModule>
# END FORESTCATERING_HEADLESS
BLOCK
  mv \"\${ht}.tmp\" \"\$ht\""

echo "── 3/4 CORS API ──"
echo "  CORS Origin: ${frontend_domain}"

echo "── 4/4 Finalizacja ──"
docker exec "${ps_cid}" apache2ctl -k graceful >/dev/null 2>&1 || true
if docker exec "${ps_cid}" test -f /var/www/html/bin/console; then
  docker exec "${ps_cid}" php /var/www/html/bin/console cache:clear --no-warmup --env=prod >/dev/null 2>&1 || true
fi

echo ""
echo "Headless setup zakończony."
echo "- API: http://127.0.0.1:8080/api/"
echo "- Klucz: ${ws_key}"
echo "- Redirect frontu: ${frontend_domain}"
