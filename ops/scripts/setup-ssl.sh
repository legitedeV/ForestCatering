#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# setup-ssl.sh — Configure SSL with Let's Encrypt
# ──────────────────────────────────────────────

# ── Colours ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ ${NC}$*"; }
ok()    { echo -e "${GREEN}✅ ${NC}$*"; }
warn()  { echo -e "${YELLOW}⚠️  ${NC}$*"; }
err()   { echo -e "${RED}❌ ${NC}$*" >&2; }

DOMAIN="${1:-forestbar.pl}"

echo ""
echo -e "${GREEN}🔐 Forest Hub — SSL Setup${NC}"
echo ""
info "Domain: $DOMAIN"

# ── Pre-flight checks ───────────────────────
if ! command -v certbot &>/dev/null; then
  err "certbot is required but not installed."
  err "Install with: sudo apt install certbot python3-certbot-nginx"
  exit 1
fi

if ! command -v nginx &>/dev/null; then
  err "nginx is required but not installed."
  exit 1
fi

if ! nginx -t &>/dev/null; then
  err "nginx configuration test failed. Fix config before setting up SSL."
  exit 1
fi

# ── Setup SSL ────────────────────────────────
info "Requesting SSL certificate..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

echo ""
ok "SSL configured for $DOMAIN"
