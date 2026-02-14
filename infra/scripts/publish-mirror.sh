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
source "${ENV_FILE}"

MIRROR_BASE_DIR="${MIRROR_BASE_DIR:-/var/www/mirror/forestcatering-infra}"
MIRROR_BASE_URL="${MIRROR_BASE_URL:-http://kadryhr.pl/mirror/forestcatering-infra}"

if [[ ! -d "${RUN_DIR}" ]]; then
  echo "Run directory does not exist: ${RUN_DIR}" >&2
  exit 1
fi

RUN_NAME="$(basename "${RUN_DIR}")"
TARGET_DIR="${MIRROR_BASE_DIR}/${RUN_NAME}"

mkdir -p "${TARGET_DIR}"
cp -a "${RUN_DIR}/." "${TARGET_DIR}/"
chown -R www-data:www-data "${MIRROR_BASE_DIR}"
find "${MIRROR_BASE_DIR}" -type d -exec chmod 755 {} +
find "${MIRROR_BASE_DIR}" -type f -exec chmod 644 {} +

echo "Published artifacts to: ${TARGET_DIR}"
echo "Mirror URL: ${MIRROR_BASE_URL}/${RUN_NAME}/"
