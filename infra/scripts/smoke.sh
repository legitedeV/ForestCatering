#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${REPO_ROOT}/infra/logs"
MIRROR_DIR="/home/forest/mirror/forestcatering"
SMOKE_LOG="${LOG_DIR}/smoke-last.log"
TARGET_HOST="${TARGET_HOST:-51.68.151.159}"

mkdir -p "${LOG_DIR}" "${MIRROR_DIR}"

TMP_LOG="$(mktemp)"
cleanup() {
  rm -f "${TMP_LOG}"
}
trap cleanup EXIT

run_check() {
  local label="$1"
  shift

  echo "[smoke] ${label}"
  set +e
  local out
  out="$("$@" 2>&1)"
  local rc=$?
  set -e

  printf '%s\n' "${out}" | sed -n '1,30p'
  printf '%s\n' "${out}" >>"${TMP_LOG}"

  if (( rc != 0 )); then
    echo "[smoke] command failed: ${label}" >&2
    return 1
  fi

  if printf '%s\n' "${out}" | grep -Eqi '^Location:\s*http://localhost'; then
    echo "[smoke] detected forbidden redirect to localhost" >&2
    return 1
  fi

  if printf '%s\n' "${out}" | grep -Eq '^HTTP/[0-9.]+ 500'; then
    echo "[smoke] detected HTTP 500" >&2
    return 1
  fi

  local status
  status="$(printf '%s\n' "${out}" | awk '/^HTTP\// {code=$2} END {print code}')"
  if [[ -z "${status}" ]]; then
    echo "[smoke] could not parse HTTP status for ${label}" >&2
    return 1
  fi

  case "${label}" in
    "GET /")
      if [[ ! "${status}" =~ ^(200|302)$ ]]; then
        echo "[smoke] GET / returned ${status}, expected 200 or 302" >&2
        return 1
      fi
      ;;
    "GET /admin-dev")
      if [[ ! "${status}" =~ ^(200|302)$ ]]; then
        echo "[smoke] GET /admin-dev returned ${status}, expected 200 or 302" >&2
        return 1
      fi
      ;;
  esac

  return 0
}

cd "${REPO_ROOT}"

{
  echo "[smoke] started at $(date -Is)"
  run_check "GET /" curl -sS -D - -o /dev/null http://127.0.0.1/
  run_check "GET / (Host override)" curl -sS -D - -o /dev/null -H "Host: ${TARGET_HOST}" http://127.0.0.1/
  run_check "GET /admin-dev" curl -sS -D - -o /dev/null -H "Host: ${TARGET_HOST}" http://127.0.0.1/admin-dev/

  echo "[smoke] tail prestashop logs (best effort)"
  docker compose --env-file "${REPO_ROOT}/infra/.env" -f "${REPO_ROOT}/infra/compose.yml" logs --no-color --tail=50 prestashop 2>/dev/null || true

  echo "[smoke] tail apache error.log (best effort)"
  CID_PS="$(docker compose --env-file "${REPO_ROOT}/infra/.env" -f "${REPO_ROOT}/infra/compose.yml" ps -q prestashop 2>/dev/null || true)"
  if [[ -n "${CID_PS}" ]]; then
    docker exec "${CID_PS}" sh -lc 'tail -n 50 /var/log/apache2/error.log' 2>/dev/null || true
  else
    echo "[smoke] prestashop container not found"
  fi

  echo "OK"
} | tee "${SMOKE_LOG}"

tmp_mirror="${MIRROR_DIR}/smoke-last.log.tmp"
cp "${SMOKE_LOG}" "${tmp_mirror}"
mv -f "${tmp_mirror}" "${MIRROR_DIR}/smoke-last.log"
