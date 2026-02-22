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

# 5. Build (clean to avoid stale cache)
cd "$PROJECT_ROOT/apps/web"
rm -rf .next
npm run build

# Copy static assets for standalone mode (workspace-aware paths)
STANDALONE_DIR="$PROJECT_ROOT/apps/web/.next/standalone/apps/web"
cp -r "$PROJECT_ROOT/apps/web/public" "$STANDALONE_DIR/public" 2>/dev/null || true
mkdir -p "$STANDALONE_DIR/.next"
cp -r "$PROJECT_ROOT/apps/web/.next/static" "$STANDALONE_DIR/.next/static" 2>/dev/null || true

# Sync missing node_modules into standalone (monorepo hoisting fix)
# Next.js standalone file tracer misses hoisted deps in npm workspaces
STANDALONE_ROOT="$PROJECT_ROOT/apps/web/.next/standalone"
if command -v rsync &>/dev/null; then
  rsync -a --ignore-existing "$PROJECT_ROOT/node_modules/" "$STANDALONE_ROOT/node_modules/"
else
  cp -rn "$PROJECT_ROOT/node_modules/"* "$STANDALONE_ROOT/node_modules/" 2>/dev/null || true
fi

# 6. PM2
pm2 startOrRestart "$PROJECT_ROOT/apps/web/ecosystem.config.cjs" --env production

# Wait for Next.js to be ready
MAX_ATTEMPTS=30
echo "Waiting for Next.js to start..."
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    echo "✅ Next.js is ready (attempt $i)."
    break
  fi
  if [[ $i -eq $MAX_ATTEMPTS ]]; then
    echo "⚠️  Next.js did not respond after ${MAX_ATTEMPTS}s — continuing with smoke tests."
  fi
  sleep 1
done

# 7. nginx
bash "$SCRIPT_DIR/ensure-nginx.sh"

# 8. Smoke tests
bash "$SCRIPT_DIR/smoke.sh"

echo "✅ Deploy complete at $(date)"
