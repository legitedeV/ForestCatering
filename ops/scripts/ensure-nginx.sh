#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Use HTTPS config if SSL cert exists, otherwise fall back to HTTP-only
if [[ -f /etc/letsencrypt/live/forestbar.pl/fullchain.pem ]]; then
  CONF_SRC="$SCRIPT_DIR/../nginx/forestbar.conf"
  CONF_NAME="forestbar.conf"
  echo "SSL certificate found — using HTTPS config."
else
  CONF_SRC="$SCRIPT_DIR/../nginx/forestcatering.conf"
  CONF_NAME="forestcatering.conf"
  echo "No SSL certificate — using HTTP-only config."
fi

CONF_DEST="/etc/nginx/sites-available/${CONF_NAME}"

echo "Installing nginx config: ${CONF_NAME}"
sudo cp "$CONF_SRC" "$CONF_DEST"
sudo ln -sf "$CONF_DEST" "/etc/nginx/sites-enabled/${CONF_NAME}"

# Clean up stale symlinks
for f in /etc/nginx/sites-enabled/*; do
  [[ -e "$f" ]] || sudo rm -f "$f"
done

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "✅ nginx configured (${CONF_NAME})."
