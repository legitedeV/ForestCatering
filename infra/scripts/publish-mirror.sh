#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <run-directory>" >&2
  exit 1
fi

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BASE_DIR}/.env"
RUN_DIR="$1"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run ./gen-secrets.sh first." >&2
  exit 1
fi
# shellcheck disable=SC1090
source "${ENV_FILE}"

MIRROR_BASE_DIR="${MIRROR_BASE_DIR:-/var/www/mirror/forestcatering-infra}"
MIRROR_BASE_URL="${MIRROR_BASE_URL:-http://51.68.151.159/mirror/forestcatering-infra}"

if [[ ! -d "${RUN_DIR}" ]]; then
  echo "Run directory does not exist: ${RUN_DIR}" >&2
  exit 1
fi

RUN_NAME="$(basename "${RUN_DIR}")"
TARGET_DIR="${MIRROR_BASE_DIR}/${RUN_NAME}"

need_sudo() {
  local parent
  parent="$(dirname "${MIRROR_BASE_DIR}")"
  [[ ! -w "${parent}" ]]
}

SUDO=""
if need_sudo; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Error: need elevated privileges to write to ${MIRROR_BASE_DIR}, but sudo is not available." >&2
    exit 1
  fi
fi

# Ensure base dir exists with correct ownership (idempotent).
if [[ -n "${SUDO}" ]]; then
  ${SUDO} install -d -o www-data -g www-data -m 0755 "${MIRROR_BASE_DIR}"
  ${SUDO} install -d -o www-data -g www-data -m 0755 "${TARGET_DIR}"
  ${SUDO} cp -a "${RUN_DIR}/." "${TARGET_DIR}/"
  ${SUDO} chown -R www-data:www-data "${TARGET_DIR}"
  ${SUDO} find "${TARGET_DIR}" -type d -exec chmod 755 {} +
  ${SUDO} find "${TARGET_DIR}" -type f -exec chmod 644 {} +
else
  install -d -m 0755 "${MIRROR_BASE_DIR}"
  install -d -m 0755 "${TARGET_DIR}"
  cp -a "${RUN_DIR}/." "${TARGET_DIR}/"
  find "${TARGET_DIR}" -type d -exec chmod 755 {} +
  find "${TARGET_DIR}" -type f -exec chmod 644 {} +
fi

echo "Published artifacts to: ${TARGET_DIR}"
echo "Mirror URL: ${MIRROR_BASE_URL}/${RUN_NAME}/"
