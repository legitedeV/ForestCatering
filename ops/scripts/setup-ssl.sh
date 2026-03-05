#!/usr/bin/env bash
set -euo pipefail
DOMAIN="${1:-forestbar.pl}"
echo "🔐 Setting up SSL for $DOMAIN"
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
echo "✅ SSL configured"
