#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEB_DIR="$PROJECT_ROOT/apps/web"
STANDALONE_APP_DIR="$WEB_DIR/.next/standalone/apps/web"
NEXT_STATIC_DIR="$WEB_DIR/.next/static"
STANDALONE_NEXT_DIR="$STANDALONE_APP_DIR/.next"
STANDALONE_STATIC_DIR="$STANDALONE_NEXT_DIR/static"
PUBLIC_DIR="$WEB_DIR/public"
STANDALONE_PUBLIC_DIR="$STANDALONE_APP_DIR/public"

if [[ ! -f "$STANDALONE_APP_DIR/server.js" ]]; then
  echo "❌ Missing standalone server: $STANDALONE_APP_DIR/server.js"
  exit 1
fi

if [[ ! -d "$NEXT_STATIC_DIR" ]]; then
  echo "❌ Missing Next static build output: $NEXT_STATIC_DIR"
  exit 1
fi

mkdir -p "$STANDALONE_NEXT_DIR"
rm -rf "$STANDALONE_STATIC_DIR" "$STANDALONE_PUBLIC_DIR"
cp -R "$NEXT_STATIC_DIR" "$STANDALONE_STATIC_DIR"
cp -R "$PUBLIC_DIR" "$STANDALONE_PUBLIC_DIR"

if [[ ! -d "$STANDALONE_STATIC_DIR/chunks" ]] || [[ -z "$(find "$STANDALONE_STATIC_DIR/chunks" -type f -print -quit)" ]]; then
  echo "❌ Standalone static chunks are missing: $STANDALONE_STATIC_DIR/chunks"
  exit 1
fi

echo "✅ Standalone prepared: $STANDALONE_APP_DIR"
