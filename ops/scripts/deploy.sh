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

# Parse flags
FORCE_BUILD=false
for arg in "$@"; do
  [[ "$arg" == "--force-build" ]] && FORCE_BUILD=true
done

# 1. Capture SHA before pull
cd "$PROJECT_ROOT"
PREV_SHA=$(git rev-parse HEAD 2>/dev/null || echo "none")

# 2. Pull latest
git pull origin main --ff-only

# 3. Capture SHA after pull
CURR_SHA=$(git rev-parse HEAD)

# 4. Source env
if [[ ! -f "$PROJECT_ROOT/ops/.env" ]]; then
  echo "❌ ops/.env not found. Run: bash ops/scripts/gen-secrets.sh"
  exit 1
fi
# shellcheck source=/dev/null
set -a
source "$PROJECT_ROOT/ops/.env"
set +a

# 5. Run setup (idempotent)
bash "$SCRIPT_DIR/setup.sh"

# Determine whether a build is needed
BUILD_ID_FILE="$PROJECT_ROOT/apps/web/.next/BUILD_ID"
NEED_BUILD=true
if [[ "$FORCE_BUILD" == "false" ]] \
   && [[ "$PREV_SHA" == "$CURR_SHA" ]] \
   && [[ -f "$BUILD_ID_FILE" ]] \
   && [[ "$(cat "$BUILD_ID_FILE")" == "$CURR_SHA" ]]; then
  NEED_BUILD=false
fi

MEDIA_SRC="$PROJECT_ROOT/apps/web/public/media"
MEDIA_BACKUP="/tmp/fc-media-backup-$$"
STANDALONE_MEDIA="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/public/media"

if [[ "$NEED_BUILD" == "true" ]]; then
  # 6. Install deps (need devDeps for build)
  cd "$PROJECT_ROOT"
  NODE_ENV=development npm ci

  # Media backup — preserve uploads across deploys
  # Ensure source media dir exists
  mkdir -p "$MEDIA_SRC"

  # Backup media from standalone (where Payload actually writes uploads)
  if [[ -d "$STANDALONE_MEDIA" ]] && find "$STANDALONE_MEDIA" -maxdepth 1 -type f ! -name '.gitkeep' | grep -q .; then
    mkdir -p "$MEDIA_BACKUP"
    cp -a "$STANDALONE_MEDIA"/. "$MEDIA_BACKUP"/
    echo "📦 Backed up $(find "$MEDIA_BACKUP" -maxdepth 1 -type f | wc -l) media files."
    # Also sync backed-up files into source public/media
    cp -an "$MEDIA_BACKUP"/. "$MEDIA_SRC"/ 2>/dev/null || true
  fi

  # 7. Build (clean to avoid stale cache)
  cd "$PROJECT_ROOT/apps/web"
  rm -rf .next
  npm run build

  # Copy static assets for standalone mode (workspace-aware paths)
  STANDALONE_DIR="$PROJECT_ROOT/apps/web/.next/standalone/apps/web"
  cp -r "$PROJECT_ROOT/apps/web/public" "$STANDALONE_DIR/public" 2>/dev/null || true
  mkdir -p "$STANDALONE_DIR/.next"
  cp -r "$PROJECT_ROOT/apps/web/.next/static" "$STANDALONE_DIR/.next/static" 2>/dev/null || true

  # Restore media files after build
  mkdir -p "$MEDIA_SRC"
  mkdir -p "$STANDALONE_MEDIA"

  if [[ -d "$MEDIA_BACKUP" ]]; then
    cp -an "$MEDIA_BACKUP"/. "$MEDIA_SRC"/ 2>/dev/null || true
    cp -an "$MEDIA_BACKUP"/. "$STANDALONE_MEDIA"/ 2>/dev/null || true
    rm -rf "$MEDIA_BACKUP"
    echo "📦 Restored media files."
  fi

  # Sync missing node_modules into standalone (monorepo hoisting fix)
  # Next.js standalone file tracer misses hoisted deps in npm workspaces
  STANDALONE_ROOT="$PROJECT_ROOT/apps/web/.next/standalone"
  if command -v rsync &>/dev/null; then
    rsync -a --ignore-existing "$PROJECT_ROOT/node_modules/" "$STANDALONE_ROOT/node_modules/"
  else
    cp -rn "$PROJECT_ROOT/node_modules/"* "$STANDALONE_ROOT/node_modules/" 2>/dev/null || true
  fi
else
  echo "⏭️  Build skipped — code unchanged (commit $CURR_SHA already built)."
fi

# Sync media source ↔ standalone (always, in case files were manually added)
mkdir -p "$MEDIA_SRC"
mkdir -p "$STANDALONE_MEDIA"
# Sync: source → standalone (catches any files from git or manual placement)
cp -an "$MEDIA_SRC"/. "$STANDALONE_MEDIA"/ 2>/dev/null || true
# Sync: standalone → source (catches any files Payload wrote to standalone)
cp -an "$STANDALONE_MEDIA"/. "$MEDIA_SRC"/ 2>/dev/null || true

# 9. PM2
pm2 startOrRestart "$PROJECT_ROOT/apps/web/ecosystem.config.cjs" --env production --update-env

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

# 10. nginx
bash "$SCRIPT_DIR/ensure-nginx.sh"

# 11. Smoke tests
bash "$SCRIPT_DIR/smoke.sh"

echo "✅ Deploy complete at $(date)"
