#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/load-env.sh"

cd "$PROJECT_ROOT"

echo "🔄 Running Payload migrations for apps/web"
npm run -w apps/web migrate -- --config payload.config.ts --tsconfig tsconfig.payload.json
