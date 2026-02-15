#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

if [[ "${1:-}" != "--yes-wipe-data" ]]; then
  echo "Refusing to wipe data. Re-run with --yes-wipe-data to destroy Docker volumes and regenerate install folders."
  exit 1
fi

runlog="$(run_dir)"
compose_cmd down -v --remove-orphans | tee "${runlog}/wipe-down.txt"

new_admin="admin-$(openssl rand -hex 4)"
new_install="install-$(openssl rand -hex 4)"
sed -i "s|^PS_FOLDER_ADMIN=.*|PS_FOLDER_ADMIN=${new_admin}|" "${ENV_FILE}"
sed -i "s|^PS_FOLDER_INSTALL=.*|PS_FOLDER_INSTALL=${new_install}|" "${ENV_FILE}"

"${SCRIPT_DIR}/resolve-prestashop-image.sh" "${runlog}" > /tmp/ps-image-env.$$ 
source /tmp/ps-image-env.$$
rm -f /tmp/ps-image-env.$$
sed -i "s|^PRESTASHOP_IMAGE=.*|PRESTASHOP_IMAGE=${PRESTASHOP_IMAGE}|" "${ENV_FILE}"
sed -i "s|^PRESTASHOP_IMAGE_DIGEST=.*|PRESTASHOP_IMAGE_DIGEST=${PRESTASHOP_IMAGE_DIGEST}|" "${ENV_FILE}"

PS_ERASE_DB=1 compose_cmd up -d | tee "${runlog}/wipe-up.txt"
sleep 5
compose_cmd ps | tee "${runlog}/compose-ps.txt"
echo "Wipe complete and stack recreated."
