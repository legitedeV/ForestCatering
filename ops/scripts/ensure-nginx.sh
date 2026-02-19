#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONF_SRC="$SCRIPT_DIR/../nginx/forestcatering.conf"
CONF_DEST="/etc/nginx/sites-available/forestcatering.conf"

echo "Installing nginx config..."
sudo cp "$CONF_SRC" "$CONF_DEST"
sudo ln -sf "$CONF_DEST" /etc/nginx/sites-enabled/forestcatering.conf

# Remove default if exists
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx
echo "✅ nginx configured."
