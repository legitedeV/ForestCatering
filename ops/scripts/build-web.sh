#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/apps/web"

# 1) ENV (wspólne dla build + runtime)
. "$ROOT/ops/scripts/load-env.sh"

echo "📦 Installing dependencies from root workspace (WITH devDependencies)"
cd "$ROOT"

# Na czas installa kasujemy NODE_ENV, żeby npm ci NIE ciął devDeps
NODE_ENV= npm ci

echo "🏗️ Building Next standalone output (apps/web/.next)"
cd "$WEB"
npm run build
