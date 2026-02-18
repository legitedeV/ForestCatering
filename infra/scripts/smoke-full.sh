#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${INFRA_DIR}/compose.yml"
ENV_FILE="${INFRA_DIR}/.env"
LOG_DIR="${INFRA_DIR}/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
PROJECT="${COMPOSE_PROJECT_NAME:-forestcatering}"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/smoke-full-${TS}.log"
touch "${LOG_FILE}"

exec > >(tee -a "${LOG_FILE}") 2>&1

mirror_log() {
  local tmp_file="${MIRROR_DIR}/smoke-full-last.log.tmp"
  cp "${LOG_FILE}" "${tmp_file}"
  mv -f "${tmp_file}" "${MIRROR_DIR}/smoke-full-last.log"
}

compose() {
  if [[ -f "${ENV_FILE}" ]]; then
    docker compose -p "${PROJECT}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
  else
    docker compose -p "${PROJECT}" -f "${COMPOSE_FILE}" "$@"
  fi
}

collect_debug_bundle() {
  {
    echo "===== DEBUG BUNDLE $(date -Is) ====="
    compose logs --tail=200 prestashop || true
    compose logs --tail=200 mariadb || true
    sudo tail -n 200 /var/log/nginx/error.log || true
    local ps_cid
    ps_cid="$(compose ps -q prestashop || true)"
    if [[ -n "${ps_cid}" ]]; then
      docker exec "${ps_cid}" sh -lc 'tail -n 200 /var/log/apache2/error.log' || true
    fi
  } >> "${LOG_FILE}" 2>&1
}

trap 'status=$?; if (( status != 0 )); then collect_debug_bundle; mirror_log; fi; exit $status' EXIT

echo "[smoke-full] started at $(date -Is)"

ps_output="$(compose ps)"
echo "${ps_output}"
if ! grep -E '^prestashop\s+.*running' <<< "${ps_output}" >/dev/null; then
  echo "[smoke-full] prestashop not running"
  exit 1
fi

ps_cid="$(compose ps -q prestashop)"
host_port="$(docker inspect "${ps_cid}" | jq -r '.[0].NetworkSettings.Ports["80/tcp"][0].HostPort // empty')"
if [[ "${host_port}" != "8080" ]]; then
  echo "[smoke-full] prestashop HostPort invalid: '${host_port:-null}'"
  exit 1
fi

echo "[smoke-full] checking loopback direct"
resp_direct="$(curl -sS -D- -o /dev/null http://127.0.0.1:8080/ | sed -n '1,30p')"
echo "${resp_direct}"
status_direct="$(awk 'NR==1{print $2}' <<< "${resp_direct}")"
if [[ "${status_direct}" != "200" && "${status_direct}" != "302" ]]; then
  echo "[smoke-full] invalid direct status: ${status_direct}"
  exit 1
fi

echo "[smoke-full] checking nginx proxy"
resp_nginx="$(curl -sS -D- -o /dev/null http://127.0.0.1/ | sed -n '1,30p')"
echo "${resp_nginx}"
status_nginx="$(awk 'NR==1{print $2}' <<< "${resp_nginx}")"
if [[ "${status_nginx}" == "502" ]]; then
  echo "[smoke-full] nginx returned 502"
  exit 1
fi
if [[ "${status_nginx}" != "200" && "${status_nginx}" != "302" ]]; then
  echo "[smoke-full] invalid nginx status: ${status_nginx}"
  exit 1
fi

echo "[smoke-full] checking backoffice"
resp_admin="$(curl -sS -D- -o /dev/null http://127.0.0.1:8080/admin-dev/ | sed -n '1,30p')"
echo "${resp_admin}"
status_admin="$(awk 'NR==1{print $2}' <<< "${resp_admin}")"
if [[ "${status_admin}" != "200" && "${status_admin}" != "302" ]]; then
  echo "[smoke-full] invalid admin status: ${status_admin}"
  exit 1
fi

if grep -qi 'Location: http://localhost' <<< "${resp_direct}${resp_nginx}${resp_admin}"; then
  echo "[smoke-full] detected localhost redirect"
  exit 1
fi

echo "[smoke-full] all checks passed"
mirror_log
