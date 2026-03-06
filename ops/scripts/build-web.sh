#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# build-web.sh — Build the Forest Hub web app
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"
ENV_FILE="$WEB_DIR/.env"

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
echo -e "${GREEN}🔨 Forest Hub — Build Web${NC}"
echo ""

# ── Pre-flight checks ───────────────────────
if [[ ! -d "$WEB_DIR" ]]; then
  err "Web app directory not found: $WEB_DIR"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  warn ".env not found at $ENV_FILE"
  warn "Run ops/scripts/gen-secrets.sh first."
  exit 1
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  warn "node_modules not found. Running npm install..."
  (cd "$ROOT_DIR" && npm install)
fi

# ── Build ────────────────────────────────────
cd "$WEB_DIR"
info "Building web app..."
npm run build

echo ""
ok "Build complete"
