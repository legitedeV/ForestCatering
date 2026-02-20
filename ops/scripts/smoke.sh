#!/usr/bin/env bash
set -euo pipefail
FAIL=0
check() {
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000")
  if [[ "$CODE" =~ ^(200|301|302)$ ]]; then echo "✅ $1 → $CODE"; else echo "❌ $1 → $CODE"; FAIL=1; fi
}
check "http://127.0.0.1:3000"
check "http://127.0.0.1:3000/admin"
check "http://127.0.0.1:3000/sklep"
check "http://127.0.0.1:3000/oferta"
check "http://127.0.0.1:3000/eventy"
check "http://127.0.0.1:3000/galeria"
check "http://127.0.0.1:3000/blog"
check "http://127.0.0.1:3000/kontakt"
check "http://127.0.0.1:3000/koszyk"
check "http://127.0.0.1:3000/regulamin"
check "http://127.0.0.1:3000/polityka-prywatnosci"
if systemctl is-active --quiet nginx 2>/dev/null; then check "http://127.0.0.1/"; fi
# HTTPS smoke (only if SSL cert exists on this machine)
if [[ -f /etc/letsencrypt/live/forestbar.pl/fullchain.pem ]]; then
  check "https://forestbar.pl/"
  check "https://forestbar.pl/oferta"
fi
[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
