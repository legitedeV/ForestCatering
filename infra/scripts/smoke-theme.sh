#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

runlog="$(run_dir)"

echo "[1/4] Uruchamianie smoke bazowego"
"${SCRIPT_DIR}/smoke.sh" > "${runlog}/smoke-base.txt" 2>&1

echo "[2/4] Aplikowanie motywu"
"${SCRIPT_DIR}/theme-apply.sh" > "${runlog}/theme-apply.txt" 2>&1

public_ip="$(awk -F= '/^SERVER_IP=/{print $2}' "${ENV_FILE}")"

check_http() {
  local url="$1" label="$2" out_file="$3"
  local code
  code="$(curl -sS -o "${out_file}" -w '%{http_code}' "${url}")"
  echo "${label} -> HTTP ${code}" | tee -a "${runlog}/http-status.txt"
  [[ "${code}" == "200" ]] || { echo "Błąd: ${label} zwrócił ${code}" >&2; exit 1; }
}

echo "[3/4] Kontrola HTTP"
check_http "http://127.0.0.1:8080/" "direct" "${runlog}/storefront-direct.html"
check_http "http://${public_ip}/" "nginx" "${runlog}/storefront-nginx.html"

echo "[4/4] Kontrola logów"
compose_cmd logs --tail=300 prestashop mariadb > "${runlog}/compose-logs-tail.txt"
if rg -i "PHP Fatal error|Fatal error" "${runlog}/compose-logs-tail.txt"; then
  echo "Wykryto PHP Fatal error w logach" >&2
  exit 1
fi

echo "Smoke theme OK. Logi: ${runlog}"
