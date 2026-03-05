#!/usr/bin/env bash
set -euo pipefail
echo "🌲 Forest Hub — Deploy"
cd "$(dirname "$0")/../.."
npm ci
npm run build
pm2 reload ecosystem.config.cjs --update-env
echo "✅ Deploy complete"
