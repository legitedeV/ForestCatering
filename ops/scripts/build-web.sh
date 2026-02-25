#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/load-env.sh"

cd "$PROJECT_ROOT"

echo "📦 Installing dependencies from root workspace"
npm ci

echo "🗃️ Applying Payload migrations"
npm run migrate:web

echo "🏗️ Building Next standalone output (apps/web/.next)"
npm run -w apps/web build

echo "🧩 Preparing standalone static/public assets"
npm run prepare:standalone:web

echo "✅ build:web completed"
