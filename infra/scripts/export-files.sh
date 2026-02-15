#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env
mkdir -p "${ARTIFACT_DIR}"
ts="$(date +%Y%m%d-%H%M%S)"
out="${ARTIFACT_DIR}/prestashop-files-${ts}.tar.gz"
volume_name="$(docker volume ls --format '{{.Name}}' | awk '/prestashop_data$/ {print; exit}')"
if [[ -z "${volume_name}" ]]; then
  echo "prestashop_data volume not found" >&2
  exit 1
fi
docker run --rm -v "${volume_name}:/src:ro" -v "${ARTIFACT_DIR}:/out" alpine:3.20 sh -lc "tar -czf /out/$(basename "${out}") -C /src ."
echo "${out}"
