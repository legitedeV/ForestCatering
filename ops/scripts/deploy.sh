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

if [[ ! -d "$STATIC_CHUNKS_DIR" ]] || [[ -z "$(find "$STATIC_CHUNKS_DIR" -type f -print -quit)" ]]; then
  echo "❌ Deploy failed: standalone chunks are missing at $STATIC_CHUNKS_DIR"
  exit 1
fi

echo "♻️ Restarting PM2 app: $PM2_APP_NAME"
pm2 delete "$PM2_APP_NAME" >/dev/null 2>&1 || true
pm2 start "$SERVER_JS" \
  --name "$PM2_APP_NAME" \
  --cwd "$STANDALONE_APP_DIR" \
  -i max \
  --update-env
pm2 save

echo "✅ Deploy finished successfully"
