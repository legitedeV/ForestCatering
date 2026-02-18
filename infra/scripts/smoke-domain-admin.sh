#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

ensure_env
mkdir -p "${INFRA_DIR}/logs"

stamp="$(date +%Y%m%d-%H%M%S)"
log_file="${INFRA_DIR}/logs/smoke-domain-admin-${stamp}.log"
mirror_dir="/home/forest/mirror/forestcatering"
mirror_log="${mirror_dir}/smoke-domain-admin-last.log"

exec > >(tee -a "${log_file}") 2>&1

resolve_target_host() {
  if [[ -n "${TARGET_HOST:-}" ]]; then
    printf '%s\n' "${TARGET_HOST}"
    return
  fi

  if [[ -f "${ENV_FILE}" ]]; then
    local env_target
    env_target="$(awk -F= '/^TARGET_HOST=/{print $2}' "${ENV_FILE}" | tail -n1 | tr -d '"' | xargs || true)"
    if [[ -n "${env_target}" ]]; then
      printf '%s\n' "${env_target}"
      return
    fi
  fi

  printf '%s\n' "51.68.151.159"
}

echo "[smoke-domain-admin] start ${stamp}"

target_host="$(resolve_target_host)"
admin_folder="$(compose_cmd exec -T prestashop sh -lc 'printf %s "${PS_FOLDER_ADMIN:-admin-dev}"')"
admin_folder="${admin_folder:-admin-dev}"

root_headers="$(curl -sS -H "Host: ${target_host}" -D- -o /dev/null http://127.0.0.1/ | sed -n '1,20p' || true)"
admin_url="http://127.0.0.1/${admin_folder}/"
admin_headers="$(curl -sS -H "Host: ${target_host}" -D- -o /dev/null "${admin_url}" | sed -n '1,20p' || true)"
themes_url="http://127.0.0.1/${admin_folder}/improve/design/themes/"
themes_headers="$(curl -sS -H "Host: ${target_host}" -D- -o /dev/null "${themes_url}" | sed -n '1,40p' || true)"

echo "[smoke-domain-admin] root headers"
printf '%s\n' "${root_headers}"

echo "[smoke-domain-admin] admin headers ${admin_url}"
printf '%s\n' "${admin_headers}"

echo "[smoke-domain-admin] themes headers ${themes_url}"
printf '%s\n' "${themes_headers}"

echo "[smoke-domain-admin] prestashop dev logs"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T prestashop sh -lc 'for f in /var/www/html/var/logs/*dev*.log; do if [ -f "$f" ]; then echo "--- $f"; tail -n 200 "$f"; fi; done' || true

echo "[smoke-domain-admin] apache error.log"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T prestashop sh -lc 'if [ -f /var/log/apache2/error.log ]; then tail -n 200 /var/log/apache2/error.log; else echo "error.log missing"; fi' || true

admin_status="$(curl -sS -H "Host: ${target_host}" -o /dev/null -w '%{http_code}' "${admin_url}" || true)"
if [[ ! "${admin_status}" =~ ^(200|302)$ ]]; then
  echo "[smoke-domain-admin] ERROR: admin status ${admin_status}" >&2
  exit 1
fi

if printf '%s\n' "${root_headers}" | grep -qi 'Location: http://localhost/'; then
  echo "[smoke-domain-admin] ERROR: root redirect still points to localhost" >&2
  exit 1
fi

mkdir -p "${mirror_dir}"
cp "${log_file}" "${mirror_log}"

echo "[smoke-domain-admin] mirror log: ${mirror_log}"
echo "[smoke-domain-admin] log: ${log_file}"
echo "[smoke-domain-admin] PASS"
