#!/usr/bin/env bash
set -euo pipefail
FAIL=0
check() {
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000")
  if [[ "$CODE" =~ ^(200|301|302)$ ]]; then echo "✅ $1 → $CODE"; else echo "❌ $1 → $CODE"; FAIL=1; fi
}

# ── Local dev (Next.js on :3000) ─────────────────────────────────────
PATHS=(
  "/"
  "/admin"
  "/sklep"
  "/oferta"
  "/eventy"
  "/galeria"
  "/blog"
  "/kontakt"
  "/koszyk"
  "/regulamin"
  "/polityka-prywatnosci"
)

for p in "${PATHS[@]}"; do
  check "http://127.0.0.1:3000${p}"
done

# ── HTTP via nginx (forestbar.pl) ────────────────────────────────────
if systemctl is-active --quiet nginx 2>/dev/null; then
  for p in "${PATHS[@]}"; do
    check "http://forestbar.pl${p}"
  done
fi

# ── HTTPS via nginx (forestbar.pl) ───────────────────────────────────
for p in "${PATHS[@]}"; do
    check "https://forestbar.pl${p}"
  done

[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
