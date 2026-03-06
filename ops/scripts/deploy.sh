#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# deploy.sh — Build and deploy Forest Hub
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/apps/web/.env"

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

echo ""
echo -e "${GREEN}🌲 Forest Hub — Deploy${NC}"
echo ""

cd "$ROOT_DIR"

# ── Pre-flight checks ───────────────────────
if ! command -v node &>/dev/null; then
  err "node is required but not installed."
  exit 1
fi

if ! command -v pm2 &>/dev/null; then
  err "pm2 is required but not installed."
  exit 1
fi

NODE_VERSION="$(node -v | sed 's/v//' | cut -d. -f1)"
if (( NODE_VERSION < 22 )); then
  err "Node.js >= 22 required (found v${NODE_VERSION})."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  warn ".env not found at $ENV_FILE"
  warn "Run ops/scripts/gen-secrets.sh first."
  exit 1
fi

if [[ ! -f "$ROOT_DIR/ecosystem.config.cjs" ]]; then
  err "ecosystem.config.cjs not found in project root."
  exit 1
fi

# ── Install dependencies ────────────────────
info "Installing dependencies..."
npm ci

# ── Build ────────────────────────────────────
info "Building project..."
npm run build

# ── Reload PM2 ──────────────────────────────
info "Reloading PM2..."
pm2 reload ecosystem.config.cjs --update-env

echo ""
ok "Deploy complete"
