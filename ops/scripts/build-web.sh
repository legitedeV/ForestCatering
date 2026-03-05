#!/usr/bin/env bash
set -euo pipefail
echo "🔨 Building Forest Hub web..."
cd "$(dirname "$0")/../../apps/web"
npm run build
echo "✅ Build complete"
