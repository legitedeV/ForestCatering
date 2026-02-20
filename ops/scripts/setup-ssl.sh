#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# Forest Catering — SSL Setup (Let's Encrypt + Certbot)
# Uruchom JEDNORAZOWO na VPS po ustawieniu DNS A/AAAA records.
#
# Wymagania wstępne:
#   - DNS A record: forestbar.pl → IP serwera
#   - DNS A record: www.forestbar.pl → IP serwera
#   - Port 80 i 443 otwarte w firewall
#   - nginx zainstalowany i działający
# =============================================================

DOMAIN="forestbar.pl"
CERTBOT_WEBROOT="/var/www/certbot"
EMAIL="${ADMIN_EMAIL:-admin@forestbar.pl}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NGINX_CONF_SRC="$SCRIPT_DIR/../nginx/forestbar.conf"

echo "=== Forest Catering — SSL Setup for ${DOMAIN} ==="

# 1. Install certbot if missing
if ! command -v certbot &>/dev/null; then
  echo "Installing certbot..."
  sudo apt-get update -qq
  sudo apt-get install -y certbot python3-certbot-nginx
fi

# 2. Create webroot for ACME challenge
sudo mkdir -p "$CERTBOT_WEBROOT"

# 3. Temporarily install HTTP-only nginx config for ACME verification
#    (certbot needs port 80 to verify domain ownership)
echo "Installing temporary HTTP config for ACME verification..."
cat <<'TMPCONF' | sudo tee /etc/nginx/sites-available/forestbar-temp.conf >/dev/null
server {
    listen 80;
    listen [::]:80;
    server_name forestbar.pl www.forestbar.pl;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
TMPCONF

sudo rm -f /etc/nginx/sites-enabled/forestcatering.conf
sudo rm -f /etc/nginx/sites-enabled/forestbar.conf
sudo rm -f /etc/nginx/sites-enabled/forestbar-temp.conf
sudo ln -sf /etc/nginx/sites-available/forestbar-temp.conf /etc/nginx/sites-enabled/forestbar-temp.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 4. Obtain certificate
echo "Requesting SSL certificate for ${DOMAIN} and www.${DOMAIN}..."
sudo certbot certonly \
  --webroot \
  --webroot-path "$CERTBOT_WEBROOT" \
  -d "$DOMAIN" \
  -d "www.${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --no-eff-email

# 4b. Generate SSL support files that certbot --webroot doesn't create
if [[ ! -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
  echo "Generating DH parameters (this may take a moment)..."
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# 5. Install full HTTPS nginx config
echo "Installing production HTTPS nginx config..."
sudo rm -f /etc/nginx/sites-enabled/forestbar-temp.conf
sudo rm -f /etc/nginx/sites-available/forestbar-temp.conf
sudo cp "$NGINX_CONF_SRC" /etc/nginx/sites-available/forestbar.conf
sudo ln -sf /etc/nginx/sites-available/forestbar.conf /etc/nginx/sites-enabled/forestbar.conf
sudo nginx -t && sudo systemctl reload nginx

# 6. Ensure auto-renewal via systemd timer (certbot installs this by default on Debian)
if systemctl list-timers --all 2>/dev/null | grep -q certbot; then
  echo "✅ certbot systemd timer is active."
else
  echo "⚠️  certbot systemd timer not found. Enable manually: sudo systemctl enable --now certbot.timer"
fi

# 7. Verify
echo ""
echo "=== Verification ==="
echo "Certificate files:"
sudo ls -la "/etc/letsencrypt/live/${DOMAIN}/" 2>/dev/null || echo "⚠️  Certificate files not found!"

echo ""
echo "✅ SSL setup complete for ${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Update ops/.env: NEXT_PUBLIC_SITE_URL=https://${DOMAIN}"
echo "  2. Rebuild the app: cd apps/web && npm run build"
echo "  3. Restart PM2: pm2 restart forestcatering"
echo "  4. Test: curl -I https://${DOMAIN}"
