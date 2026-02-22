#!/usr/bin/env bash
set -euo pipefail

# ==============================================================
# ForestCatering — Production Hot-Fix
# Problem: MODULE_NOT_FOUND + Server Action mismatch
# Root Cause: standalone build brakuje node_modules z monorepo root
# ==============================================================

PROJECT_ROOT="/home/forest/ForestCatering"
WEB_DIR="$PROJECT_ROOT/apps/web"
STANDALONE_DIR="$WEB_DIR/.next/standalone"
STANDALONE_WEB="$STANDALONE_DIR/apps/web"

echo "=== 1. Zatrzymanie PM2 ==="
pm2 stop forestcatering 2>/dev/null || true

echo "=== 2. Pull najnowszego kodu ==="
cd "$PROJECT_ROOT"
git pull origin main --ff-only

echo "=== 3. Załadowanie env ==="
set -a
source "$PROJECT_ROOT/ops/.env"
set +a

echo "=== 4. Czysty install dependencies ==="
cd "$PROJECT_ROOT"
rm -rf node_modules apps/web/node_modules
NODE_ENV=development npm ci

echo "=== 5. Wyczyszczenie starego buildu ==="
cd "$WEB_DIR"
rm -rf .next

echo "=== 6. Fresh build ==="
npm run build

echo "=== 7. Kopiowanie brakujących assets do standalone ==="
# public (Next standalone nie kopiuje automatycznie)
cp -r "$WEB_DIR/public" "$STANDALONE_WEB/public" 2>/dev/null || true

# static (kluczowe dla cache bust)
mkdir -p "$STANDALONE_WEB/.next"
cp -r "$WEB_DIR/.next/static" "$STANDALONE_WEB/.next/static"

echo "=== 8. Naprawienie node_modules w standalone (monorepo fix) ==="
# Next standalone w monorepo tworzy drzewo:
#   .next/standalone/
#     ├── node_modules/       ← root-level deps (hoisted)
#     └── apps/web/
#          ├── server.js
#          └── node_modules/  ← web-level deps (powinny być, ale tracer może pominąć)
#
# Sprawdzenie: jeśli standalone root node_modules nie istnieje lub jest niekompletny,
# kopiujemy brakujące moduły.

# Kopiuj sharp (native binary, często pomijany przez tracer)
if [ ! -d "$STANDALONE_DIR/node_modules/sharp" ]; then
  echo "  → Kopiowanie sharp do standalone..."
  cp -r "$PROJECT_ROOT/node_modules/sharp" "$STANDALONE_DIR/node_modules/sharp" 2>/dev/null || true
fi

# Kopiuj @payloadcms (jeśli brakuje w standalone)
if [ ! -d "$STANDALONE_DIR/node_modules/@payloadcms" ]; then
  echo "  → Kopiowanie @payloadcms do standalone..."
  mkdir -p "$STANDALONE_DIR/node_modules/@payloadcms"
  cp -r "$PROJECT_ROOT/node_modules/@payloadcms/"* "$STANDALONE_DIR/node_modules/@payloadcms/" 2>/dev/null || true
fi

# Uniwersalny fallback: rsync brakujących modułów
# (kopiuje tylko to, czego w standalone nie ma — szybkie i bezpieczne)
echo "  → Syncing brakujących node_modules z root..."
if command -v rsync &>/dev/null; then
  rsync -a --ignore-existing "$PROJECT_ROOT/node_modules/" "$STANDALONE_DIR/node_modules/"
else
  # Fallback bez rsync
  cp -rn "$PROJECT_ROOT/node_modules/"* "$STANDALONE_DIR/node_modules/" 2>/dev/null || true
fi

echo "=== 9. Restart PM2 ==="
cd "$WEB_DIR"
pm2 startOrRestart ecosystem.config.cjs --env production

echo "=== 10. Czekanie na start (max 15s) ==="
for i in $(seq 1 15); do
  sleep 1
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000" 2>/dev/null || echo "000")
  if [[ "$CODE" =~ ^(200|301|302)$ ]]; then
    echo "  ✅ Strona odpowiada: HTTP $CODE (po ${i}s)"
    break
  fi
  echo "  ⏳ Czekam... (${i}s, HTTP $CODE)"
done

echo "=== 11. Smoke test ==="
bash "$PROJECT_ROOT/ops/scripts/smoke.sh"

echo ""
echo "=== 12. Status PM2 ==="
pm2 status
pm2 logs forestcatering --lines 5 --nostream

echo ""
echo "✅ Fix complete. Jeśli error nadal występuje, sprawdź:"
echo "   tail -30 /home/forest/.pm2/logs/forestcatering-error.log"
echo ""
echo "⚠️  Klienci z otwartą kartą mogą widzieć 'Failed to find Server Action'"
echo "   — to normalne, rozwiąże się po odświeżeniu strony (Ctrl+R)."
