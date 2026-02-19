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
git pull --ff-only

# 2. Source env
if [[ ! -f "$PROJECT_ROOT/ops/.env" ]]; then
  echo "❌ ops/.env not found. Run: bash ops/scripts/gen-secrets.sh"
  exit 1
fi
# shellcheck source=/dev/null
source "$PROJECT_ROOT/ops/.env"

# 3. Run setup (idempotent)
bash "$SCRIPT_DIR/setup.sh"

# 4. Build
cd "$PROJECT_ROOT/apps/web"
npm ci
npm run build

# 5. PM2
pm2 startOrRestart "$PROJECT_ROOT/apps/web/ecosystem.config.js" --env production

# 6. nginx
bash "$SCRIPT_DIR/ensure-nginx.sh"

# 7. Smoke tests
bash "$SCRIPT_DIR/smoke.sh"

echo "✅ Deploy complete at $(date)"
