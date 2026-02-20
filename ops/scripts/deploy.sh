#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/ops/logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Forest Catering — Deploy ==="
echo "Started at $(date)"

# 1. Pull latest
cd "$PROJECT_ROOT"
git pull origin main --ff-only

# 2. Source env
if [[ ! -f "$PROJECT_ROOT/ops/.env" ]]; then
  echo "❌ ops/.env not found. Run: bash ops/scripts/gen-secrets.sh"
  exit 1
fi
# shellcheck source=/dev/null
set -a
source "$PROJECT_ROOT/ops/.env"
set +a

# 3. Run setup (idempotent)
bash "$SCRIPT_DIR/setup.sh"

# 4. Install deps (need devDeps for build)
cd "$PROJECT_ROOT"
NODE_ENV=development npm ci

# 5. Build
cd "$PROJECT_ROOT/apps/web"
npm run build

# Copy static assets for standalone mode (workspace-aware paths)
STANDALONE_DIR="$PROJECT_ROOT/apps/web/.next/standalone/apps/web"
cp -r "$PROJECT_ROOT/apps/web/public" "$STANDALONE_DIR/public" 2>/dev/null || true
mkdir -p "$STANDALONE_DIR/.next"
cp -r "$PROJECT_ROOT/apps/web/.next/static" "$STANDALONE_DIR/.next/static" 2>/dev/null || true

# 6. PM2
pm2 startOrRestart "$PROJECT_ROOT/apps/web/ecosystem.config.cjs" --env production

# 7. nginx
bash "$SCRIPT_DIR/ensure-nginx.sh"

# 8. Smoke tests
bash "$SCRIPT_DIR/smoke.sh"

echo "✅ Deploy complete at $(date)"
