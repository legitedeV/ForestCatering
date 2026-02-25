#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/ops/logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

SCRIPT_PATH="$PROJECT_ROOT/ops/scripts/deploy.sh"
SELF_REEXEC_GUARD="${DEPLOY_SELF_UPDATED:-0}"

calc_hash() {
  local target="$1"
  if command -v sha256sum &>/dev/null; then
    sha256sum "$target" | awk '{print $1}'
  else
    shasum -a 256 "$target" | awk '{print $1}'
  fi
}

extract_uri_credentials() {
  local uri="$1"
  local authority
  authority="${uri#*://}"
  authority="${authority%%/*}"
  echo "${authority%%@*}"
}

validate_db_env_consistency() {
  local postgres_password="$1"
  local database_uri="$2"

  if [[ -z "$postgres_password" || -z "$database_uri" ]]; then
    echo "❌ Missing POSTGRES_PASSWORD or DATABASE_URI in ops/.env"
    echo "   Run: bash ops/scripts/gen-secrets.sh"
    exit 1
  fi

  local credentials uri_user uri_password
  credentials="$(extract_uri_credentials "$database_uri")"

  if [[ "$credentials" != *:* ]]; then
    echo "❌ DATABASE_URI has no explicit user:password section."
    echo "   DATABASE_URI=$database_uri"
    echo "   Run: bash ops/scripts/gen-secrets.sh"
    exit 1
  fi

  uri_user="${credentials%%:*}"
  uri_password="${credentials#*:}"

  if [[ "$uri_password" != "$postgres_password" ]]; then
    echo "❌ DB credentials drift detected: POSTGRES_PASSWORD != DATABASE_URI password"
    echo "   POSTGRES_USER=$uri_user"
    echo "   Refusing deploy to avoid /admin 500 (Postgres auth failure)."
    echo "   Fix: bash ops/scripts/gen-secrets.sh"
    exit 1
  fi
}

validate_db_connectivity() {
  local database_uri="$1"

  if ! command -v psql &>/dev/null; then
    echo "❌ psql not found. Install PostgreSQL client before deploy."
    echo "   Ubuntu/Debian: sudo apt-get install -y postgresql-client"
    exit 1
  fi

  echo "🔎 Checking PostgreSQL connectivity via DATABASE_URI..."
  if ! PGCONNECT_TIMEOUT=5 psql "$database_uri" -v ON_ERROR_STOP=1 -c "select 1;" >/dev/null; then
    echo "❌ Database connectivity/authentication test failed."
    echo "   Command: psql \"\$DATABASE_URI\" -c \"select 1;\""
    echo "   Refusing deploy to avoid runtime /admin 500 payloadInitError."
    echo "   Runbook: ops/README.md (DB auth recovery)"
    exit 1
  fi

  echo "✅ PostgreSQL connectivity check passed."
}

validate_pm2_standalone_entrypoint() {
  local ecosystem_file="$PROJECT_ROOT/apps/web/ecosystem.config.cjs"

  if [[ ! -f "$ecosystem_file" ]]; then
    echo "❌ Missing PM2 config file: $ecosystem_file"
    exit 1
  fi

  local pm2_check
  pm2_check=$(node - "$ecosystem_file" <<'NODE'
const path = require('path');
const ecosystemPath = path.resolve(process.argv[2]);
const cfg = require(ecosystemPath);
const app = (cfg.apps && cfg.apps[0]) || {};
const expectedCwd = path.resolve(path.dirname(ecosystemPath), '.next/standalone/apps/web');
const expectedScript = path.resolve(expectedCwd, 'server.js');
const actualCwd = path.resolve(app.cwd || '');
const actualScript = path.resolve(app.script || '');
if (actualCwd !== expectedCwd || actualScript !== expectedScript) {
  console.error(`mismatch|${actualCwd}|${actualScript}|${expectedCwd}|${expectedScript}`);
  process.exit(1);
}
console.log(`ok|${actualCwd}|${actualScript}`);
NODE
 2>&1) || {
    echo "❌ PM2 config must use standalone entrypoint apps/web/.next/standalone/apps/web/server.js"
    echo "   Details: $pm2_check"
    exit 1
  }

  echo "✅ PM2 config verified: ${pm2_check#ok|}"
}

verify_standalone_static_artifacts() {
  local source_next_dir="$PROJECT_ROOT/apps/web/.next"
  local source_static_dir="$source_next_dir/static"
  local standalone_next_dir="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/.next"
  local standalone_static_dir="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/.next/static"
  local validation_failed=0

  require_manifest_when_used() {
    local manifest_name="$1"
    local source_manifest="$source_next_dir/$manifest_name"
    local standalone_manifest="$standalone_next_dir/$manifest_name"

    if [[ -f "$source_manifest" && ! -f "$standalone_manifest" ]]; then
      echo "❌ Manifest '$manifest_name' exists in source build but is missing in standalone: $standalone_manifest"
      validation_failed=1
    fi
  }

  if [[ ! -d "$standalone_static_dir" ]]; then
    echo "❌ Missing standalone static directory: $standalone_static_dir"
    validation_failed=1
  fi

  if [[ ! -d "$source_static_dir" ]]; then
    echo "❌ Missing source static directory: $source_static_dir"
    validation_failed=1
  fi

  if [[ -d "$standalone_static_dir" ]] && [[ -z "$(find "$standalone_static_dir" -type f -name '*.js' -print -quit 2>/dev/null)" ]]; then
    echo "❌ No .js files found in standalone static assets: $standalone_static_dir"
    validation_failed=1
  fi

  if [[ -d "$standalone_static_dir" ]] && [[ -z "$(find "$standalone_static_dir" -type f -name '*.css' -print -quit 2>/dev/null)" ]]; then
    echo "❌ No .css files found in standalone static assets: $standalone_static_dir"
    validation_failed=1
  fi

  require_manifest_when_used "build-manifest.json"
  require_manifest_when_used "app-build-manifest.json"

  if [[ "$validation_failed" -ne 0 ]]; then
    echo "❌ Standalone/static validation failed."
    exit 1
  fi

  echo "✅ Standalone static artifacts verified."
}

sync_standalone_assets() {
  local standalone_next_dir="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/.next"
  local standalone_public_dir="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/public"
  local source_public_dir="$PROJECT_ROOT/apps/web/public"
  local source_static_dir="$PROJECT_ROOT/apps/web/.next/static"
  local standalone_static_dir="$standalone_next_dir/static"

  if [[ ! -d "$source_static_dir" ]]; then
    echo "❌ Missing Next.js static assets at $source_static_dir"
    echo "   Build artifact is incomplete."
    exit 1
  fi

  mkdir -p "$standalone_next_dir"
  rm -rf "$standalone_public_dir" "$standalone_static_dir"

  cp -r "$source_public_dir" "$standalone_public_dir"
  cp -r "$source_static_dir" "$standalone_static_dir"
}

# ---- NEW: dependency install caching based on lockfile hash ----
LOCKFILE="$PROJECT_ROOT/package-lock.json"
LOCK_HASH_FILE="$PROJECT_ROOT/node_modules/.package-lock.sha256"

should_install_deps() {
  [[ ! -f "$LOCKFILE" ]] && return 0
  local curr_hash
  curr_hash="$(calc_hash "$LOCKFILE")"
  [[ ! -f "$LOCK_HASH_FILE" ]] && return 0
  local prev_hash
  prev_hash="$(cat "$LOCK_HASH_FILE" 2>/dev/null || true)"
  [[ "$curr_hash" != "$prev_hash" ]] && return 0
  return 1
}

record_lock_hash() {
  [[ ! -f "$LOCKFILE" ]] && return 0
  mkdir -p "$PROJECT_ROOT/node_modules"
  calc_hash "$LOCKFILE" > "$LOCK_HASH_FILE"
}

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Forest Catering — Deploy ==="
echo "Started at $(date)"

FORCE_BUILD=false
for arg in "$@"; do
  [[ "$arg" == "--force-build" ]] && FORCE_BUILD=true
done

cd "$PROJECT_ROOT"
PREV_SHA=$(git rev-parse HEAD 2>/dev/null || echo "none")
PRE_PULL_SCRIPT_HASH=$(calc_hash "$SCRIPT_PATH")

git pull origin main --ff-only

CURR_SHA=$(git rev-parse HEAD)
POST_PULL_SCRIPT_HASH=$(calc_hash "$SCRIPT_PATH")

if [[ "$PRE_PULL_SCRIPT_HASH" != "$POST_PULL_SCRIPT_HASH" ]]; then
  if [[ "${SELF_REEXEC_GUARD}" != "1" ]]; then
    echo "♻️  deploy.sh was updated — re-executing latest version."
    exec env DEPLOY_SELF_UPDATED=1 bash "$SCRIPT_PATH" "$@"
  fi
  echo "⚠️  deploy.sh changed but guard active; continuing."
fi

if [[ ! -f "$PROJECT_ROOT/ops/.env" ]]; then
  echo "❌ ops/.env not found. Run: bash ops/scripts/gen-secrets.sh"
  exit 1
fi
set -a
source "$PROJECT_ROOT/ops/.env"
set +a

validate_db_env_consistency "${POSTGRES_PASSWORD:-}" "${DATABASE_URI:-}"
validate_db_connectivity "${DATABASE_URI:-}"

bash "$SCRIPT_DIR/setup.sh"

BUILD_ID_FILE="$PROJECT_ROOT/apps/web/.next/BUILD_ID"
STANDALONE_SERVER="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/server.js"
STANDALONE_STATIC="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/.next/static"
NEED_BUILD=true
BUILD_DECISION_REASONS=()

if [[ "$FORCE_BUILD" == "true" ]]; then
  BUILD_DECISION_REASONS+=("force-build flag enabled")
else
  if [[ "$PREV_SHA" != "$CURR_SHA" ]]; then
    BUILD_DECISION_REASONS+=("git revision changed ($PREV_SHA -> $CURR_SHA)")
  fi

  if [[ ! -f "$BUILD_ID_FILE" ]]; then
    BUILD_DECISION_REASONS+=("missing BUILD_ID")
  else
    BUILD_ID_VALUE="$(cat "$BUILD_ID_FILE")"
    if [[ "$BUILD_ID_VALUE" != "$CURR_SHA" ]]; then
      BUILD_DECISION_REASONS+=("BUILD_ID mismatch ($BUILD_ID_VALUE != $CURR_SHA)")
    fi
  fi

  if [[ ! -f "$STANDALONE_SERVER" ]]; then
    BUILD_DECISION_REASONS+=("missing standalone server.js")
  fi

  if [[ ! -d "$STANDALONE_STATIC" ]]; then
    BUILD_DECISION_REASONS+=("missing standalone static directory")
  fi

  if [[ ${#BUILD_DECISION_REASONS[@]} -eq 0 ]]; then
    NEED_BUILD=false
    BUILD_DECISION_REASONS+=("BUILD_ID matches current commit and standalone artifacts are present")
  fi
fi

if [[ "$NEED_BUILD" == "true" ]]; then
  echo "🧱 Build decision: BUILD (reasons: ${BUILD_DECISION_REASONS[*]})"
else
  echo "⏭️  Build decision: SKIP (reasons: ${BUILD_DECISION_REASONS[*]})"
fi

MEDIA_SRC="$PROJECT_ROOT/apps/web/public/media"
MEDIA_BACKUP="/tmp/fc-media-backup-$$"
STANDALONE_MEDIA="$PROJECT_ROOT/apps/web/.next/standalone/apps/web/public/media"

if [[ "$NEED_BUILD" == "true" ]]; then
  cd "$PROJECT_ROOT"

  # ---- NEW: only install deps if lockfile hash changed ----
  if should_install_deps; then
    echo "📦 Installing deps (lockfile changed or no cache)..."
    NODE_ENV=development npm ci --prefer-offline --no-audit --fund=false
    record_lock_hash
  else
    echo "⏭️  Skipping npm ci (lockfile unchanged)."
  fi

  mkdir -p "$MEDIA_SRC"

  if [[ -d "$STANDALONE_MEDIA" ]] && find "$STANDALONE_MEDIA" -maxdepth 1 -type f ! -name '.gitkeep' | grep -q .; then
    mkdir -p "$MEDIA_BACKUP"
    cp -a "$STANDALONE_MEDIA"/. "$MEDIA_BACKUP"/
    echo "📦 Backed up $(find "$MEDIA_BACKUP" -maxdepth 1 -type f | wc -l) media files."
    cp -an "$MEDIA_BACKUP"/. "$MEDIA_SRC"/ 2>/dev/null || true
  fi

  cd "$PROJECT_ROOT/apps/web"

  # ---- NEW: keep .next/cache to preserve build cache ----
  mkdir -p .next/cache
  rm -rf .next/standalone .next/static

  echo "🏗️  Building (ESLint disabled for speed)..."
  NEXT_DISABLE_ESLINT=1 NEXT_TELEMETRY_DISABLED=1 npm run build

  mkdir -p "$MEDIA_SRC" "$STANDALONE_MEDIA"
  if [[ -d "$MEDIA_BACKUP" ]]; then
    cp -an "$MEDIA_BACKUP"/. "$MEDIA_SRC"/ 2>/dev/null || true
    cp -an "$MEDIA_BACKUP"/. "$STANDALONE_MEDIA"/ 2>/dev/null || true
    rm -rf "$MEDIA_BACKUP"
    echo "📦 Restored media files."
  fi

  STANDALONE_ROOT="$PROJECT_ROOT/apps/web/.next/standalone"
  if command -v rsync &>/dev/null; then
    rsync -a --ignore-existing "$PROJECT_ROOT/node_modules/" "$STANDALONE_ROOT/node_modules/"
  else
    cp -rn "$PROJECT_ROOT/node_modules/"* "$STANDALONE_ROOT/node_modules/" 2>/dev/null || true
  fi
else
  echo "⏭️  Build skipped — commit $CURR_SHA already has valid standalone artifacts."
fi

MIGRATIONS_INDEX="$PROJECT_ROOT/apps/web/src/migrations/index.ts"
if [[ ! -f "$MIGRATIONS_INDEX" ]]; then
  echo "❌ Missing migrations index at $MIGRATIONS_INDEX"
  exit 1
fi

cd "$PROJECT_ROOT/apps/web"
PAYLOAD_BIN="$PROJECT_ROOT/node_modules/payload/bin.js"
if [[ ! -f "$PAYLOAD_BIN" ]]; then
  echo "❌ Payload CLI not available at $PAYLOAD_BIN."
  exit 1
fi

echo "🔄 Running Payload migrations..."
if [[ ! -f "$PROJECT_ROOT/apps/web/tsconfig.payload.json" ]]; then
  echo "❌ Missing apps/web/tsconfig.payload.json"
  exit 1
fi

node "$PAYLOAD_BIN" migrate --config payload.config.ts --tsconfig tsconfig.payload.json
echo "✅ Payload migrations completed."

echo "🔎 Running DB schema diagnostics..."
npm run diag:db

sync_standalone_assets
verify_standalone_static_artifacts

mkdir -p "$MEDIA_SRC" "$STANDALONE_MEDIA"
cp -an "$MEDIA_SRC"/. "$STANDALONE_MEDIA"/ 2>/dev/null || true
cp -an "$STANDALONE_MEDIA"/. "$MEDIA_SRC"/ 2>/dev/null || true

validate_pm2_standalone_entrypoint

echo "📂 Standalone directory snapshot:"
ls -l "$PROJECT_ROOT/apps/web/.next/standalone/apps/web" || true

pm2 startOrRestart "$PROJECT_ROOT/apps/web/ecosystem.config.cjs" --update-env
pm2 restart forestcatering --update-env

MAX_ATTEMPTS=30
echo "Waiting for Next.js to start..."
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    echo "✅ Next.js is ready (attempt $i)."
    break
  fi
  sleep 1
done

bash "$SCRIPT_DIR/ensure-nginx.sh"

curl -sS -H "Cache-Control: no-cache" -H "Pragma: no-cache" "http://127.0.0.1:3000/?_refresh=$(date +%s)" >/dev/null || true
bash "$SCRIPT_DIR/smoke.sh"

echo "✅ Deploy complete at $(date)"
