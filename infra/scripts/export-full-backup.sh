#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env
mkdir -p "${ARTIFACT_DIR}"
ts="$(date +%Y%m%d-%H%M%S)"
workdir="${ARTIFACT_DIR}/full-${ts}"
mkdir -p "${workdir}"

DB_OUT="${workdir}/mariadb-${ts}.sql.gz"
FILES_OUT="${workdir}/prestashop-files-${ts}.tar.gz"

compose_cmd exec -T mariadb sh -lc 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' | gzip -c > "${DB_OUT}"
volume_name="$(docker volume ls --format '{{.Name}}' | awk '/prestashop_data$/ {print; exit}')"
docker run --rm -v "${volume_name}:/src:ro" -v "${workdir}:/out" alpine:3.20 sh -lc "tar -czf /out/$(basename "${FILES_OUT}") -C /src ."

cp "${COMPOSE_FILE}" "${workdir}/compose.yml"
cp "${INFRA_DIR}/.env.example" "${workdir}/.env.example"
awk '/^##/{print} /^-/{print}' "${INFRA_DIR}/README.md" > "${workdir}/README-excerpt.md" || true
printf 'PRESTASHOP_IMAGE=%s\nPRESTASHOP_IMAGE_DIGEST=%s\n' "$(awk -F= '/^PRESTASHOP_IMAGE=/{print $2}' "${ENV_FILE}")" "$(awk -F= '/^PRESTASHOP_IMAGE_DIGEST=/{print $2}' "${ENV_FILE}")" > "${workdir}/image.txt"

tarball="${ARTIFACT_DIR}/full-${ts}.tar.gz"
tar -czf "${tarball}" -C "${ARTIFACT_DIR}" "full-${ts}"
echo "${tarball}"
