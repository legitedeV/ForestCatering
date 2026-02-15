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
compose_cmd up -d
compose_cmd ps | tee "${runlog}/compose-ps.txt"
echo "Stack started. Logs: ${runlog}"
