#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${1:-${INFRA_DIR}/logs/run-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "${LOG_DIR}"

candidates=(
  "prestashop/prestashop:9.0.2-apache"
  "prestashop/prestashop:9.0.1-apache"
  "prestashop/prestashop:9.0.0-apache"
  "prestashop/prestashop:9.0-apache"
  "prestashop/prestashop:9-apache"
  "prestashop/prestashop:8.2.1-apache"
)

chosen=""
digest=""
for image in "${candidates[@]}"; do
  if out="$(docker manifest inspect "${image}" 2>/dev/null)"; then
    chosen="${image}"
    digest="$(printf '%s' "${out}" | awk -F'"' '/"digest"/ {print $4; exit}')"
    break
  fi
done

if [[ -z "${chosen}" ]]; then
  chosen="prestashop/prestashop:9-apache"
  digest="unresolved"
fi

printf 'PRESTASHOP_IMAGE=%s\nPRESTASHOP_IMAGE_DIGEST=%s\n' "${chosen}" "${digest}" | tee "${LOG_DIR}/resolved-image.txt"
printf '%s\n' "${chosen}" > "${LOG_DIR}/resolved-image-tag.txt"
