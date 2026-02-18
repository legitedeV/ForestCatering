#!/usr/bin/env bash
set -euo pipefail

COMPOSE=(docker compose -p forestcatering -f infra/compose.yml)
THEME_SRC="themes/forestcatering-premium"
THEME_DST="/var/www/html/themes/forestcatering-premium"
LOG_FILE="infra/logs/theme-sync-last.log"
MIRROR_FILE="/home/forest/mirror/forestcatering/theme-sync-last.log"

mkdir -p "$(dirname "$LOG_FILE")"

ts="$(date -Is)"
{
  echo "[start] ${ts}"
  echo "[info] source=${THEME_SRC}"
} > "$LOG_FILE"

CID="$(${COMPOSE[@]} ps -q prestashop)"
if [[ -z "${CID}" ]]; then
  echo "[error] Prestashop container is not running" | tee -a "$LOG_FILE"
  exit 1
fi

echo "[info] container=${CID}" >> "$LOG_FILE"

docker cp "${THEME_SRC}/." "${CID}:${THEME_DST}/"
docker exec "$CID" sh -lc "chown -R www-data:www-data '${THEME_DST}' && rm -rf /var/www/html/var/cache/*"

echo "[done] $(date -Is)" >> "$LOG_FILE"

mkdir -p "$(dirname "$MIRROR_FILE")"
TMP_MIRROR="$(mktemp "${MIRROR_FILE}.tmp.XXXXXX")"
cp "$LOG_FILE" "$TMP_MIRROR"
mv -f "$TMP_MIRROR" "$MIRROR_FILE"
