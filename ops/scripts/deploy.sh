#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEB_DIR="$PROJECT_ROOT/apps/web"
STANDALONE_APP_DIR="$WEB_DIR/.next/standalone/apps/web"
SERVER_JS="$STANDALONE_APP_DIR/server.js"
STATIC_CHUNKS_DIR="$STANDALONE_APP_DIR/.next/static/chunks"
PM2_APP_NAME="forestcatering"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/load-env.sh"

cd "$PROJECT_ROOT"

echo "🚀 Deploy started"
echo "📦 Running unified build pipeline"
npm run build:web

if [[ ! -f "$SERVER_JS" ]]; then
  echo "❌ Deploy failed: missing standalone server.js at $SERVER_JS"
  exit 1
fi

bash ops/scripts/prepare-standalone.sh

echo "♻️ Restarting PM2 app: $PM2_APP_NAME"
# Nowe — 1 proces wg ecosystem.config.cjs
pm2 delete forestcatering || true
pm2 start ecosystem.config.cjs --only forestcatering --update-env
pm2 save
echo "✅ Deploy finished successfully"
