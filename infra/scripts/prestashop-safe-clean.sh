#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not installed in PATH" >&2
  exit 1
fi

echo "Clearing PrestaShop cache/log directories and fixing ownership..."
docker compose -f "$COMPOSE_FILE" exec -T prestashop sh -lc '
  rm -rf /var/www/html/var/cache/*
  rm -rf /var/www/html/var/log/* /var/www/html/var/logs/*
  chown -R www-data:www-data /var/www/html
'

echo "Restarting prestashop service..."
docker compose -f "$COMPOSE_FILE" restart prestashop

echo "Done."
