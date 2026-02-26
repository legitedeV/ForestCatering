#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/forest/ForestCatering"
WEB_DIR="$ROOT_DIR/apps/web"
OUT_DIR="$WEB_DIR/.next"
STANDALONE_DIR="$OUT_DIR/standalone/apps/web"

echo "=== prepare-standalone: sanity ==="

if [ ! -f "$OUT_DIR/BUILD_ID" ]; then
  echo "❌ Brak BUILD_ID w $OUT_DIR – najpierw musi być uruchomiony next build."
  exit 1
fi

if [ ! -f "$STANDALONE_DIR/server.js" ]; then
  echo "❌ Brak server.js w $STANDALONE_DIR – output: 'standalone' nie został wygenerowany (sprawdź next.config)."
  exit 1
fi

if [ ! -d "$OUT_DIR/static" ]; then
  echo "❌ Brak katalogu $OUT_DIR/static – Next nie wygenerował static assets."
  exit 1
fi

echo "=== Sync: .next/static -> standalone/.next/static (cp -a) ==="
rm -rf "$STANDALONE_DIR/.next/static"
mkdir -p "$STANDALONE_DIR/.next/static"
cp -a "$OUT_DIR/static/." "$STANDALONE_DIR/.next/static/"

echo "=== Sync: public -> standalone/public (cp -a) ==="
if [ -d "$WEB_DIR/public" ]; then
  rm -rf "$STANDALONE_DIR/public"
  mkdir -p "$STANDALONE_DIR/public"
  cp -a "$WEB_DIR/public/." "$STANDALONE_DIR/public/"
fi

echo "=== Sample pliki z runtime static ==="
find "$STANDALONE_DIR/.next/static" -maxdepth 5 -type f \( -name '*.js' -o -name '*.css' \) | head -n 40 || true

echo "✅ prepare-standalone: OK (server.js + .next/static + public gotowe)"
