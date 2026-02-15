#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

runlog="$(run_dir)"
"${SCRIPT_DIR}/resolve-prestashop-image.sh" "${runlog}" > /tmp/ps-image-env.$$ 
source /tmp/ps-image-env.$$
rm -f /tmp/ps-image-env.$$
sed -i "s|^PRESTASHOP_IMAGE=.*|PRESTASHOP_IMAGE=${PRESTASHOP_IMAGE}|" "${ENV_FILE}"
sed -i "s|^PRESTASHOP_IMAGE_DIGEST=.*|PRESTASHOP_IMAGE_DIGEST=${PRESTASHOP_IMAGE_DIGEST}|" "${ENV_FILE}"

compose_cmd config > "${runlog}/compose-config.txt"
compose_cmd up -d > "${runlog}/up.txt"

for svc in mariadb redis; do
  for _ in {1..40}; do
    status="$(compose_cmd ps --format json 2>/dev/null | python3 -c "import json,sys; data=json.load(sys.stdin); svc='${svc}';print(next((x.get('Health','') for x in data if x.get('Service')==svc),''))" || true)"
    if [[ "${status}" == "healthy" ]]; then break; fi
    sleep 3
  done
done

compose_cmd ps | tee "${runlog}/compose-ps.txt"

ps_cid="$(compose_cmd ps -q prestashop)"
db_cid="$(compose_cmd ps -q mariadb)"

docker exec "${ps_cid}" php -r 'echo gethostbyname("api.prestashop.com").PHP_EOL;' | tee "${runlog}/prestashop-egress-dns.txt"
docker exec "${ps_cid}" sh -lc 'curl -fsS https://api.prestashop.com/ | head -c 200' | tee "${runlog}/prestashop-egress-http.txt"

docker exec "${db_cid}" mariadb -uroot -p"$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")" "$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")" -e 'SELECT COUNT(*) AS lang_count FROM ps_lang;' | tee "${runlog}/db-ps_lang.txt"
docker exec "${db_cid}" mariadb -uroot -p"$(awk -F= '/^MARIADB_ROOT_PASSWORD=/{print $2}' "${ENV_FILE}")" "$(awk -F= '/^MARIADB_DATABASE=/{print $2}' "${ENV_FILE}")" -e "SELECT value FROM ps_configuration WHERE name='PS_LANG_DEFAULT';" | tee "${runlog}/db-ps_lang-default.txt"

curl -fsS -I http://127.0.0.1:8080/ | tee "${runlog}/http-head.txt"
curl -fsS http://127.0.0.1:8080/ | head -n 20 | tee "${runlog}/http-body-head.txt"

compose_cmd logs --tail=300 prestashop mariadb > "${runlog}/compose-logs.txt"
docker exec "${ps_cid}" sh -lc 'cat /var/log/apache2/error.log' > "${runlog}/apache-error.log" || true

if rg -q "Translator|locale|fatal|exception" "${runlog}/apache-error.log"; then
  echo "Warning: apache error log contains potential errors" | tee "${runlog}/warnings.txt"
fi

echo "Smoke log directory: ${runlog}"
