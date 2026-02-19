#!/usr/bin/env bash
set -euo pipefail
FAIL=0
check() {
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000")
  if [[ "$CODE" =~ ^(200|301|302)$ ]]; then echo "✅ $1 → $CODE"; else echo "❌ $1 → $CODE"; FAIL=1; fi
}
check "http://127.0.0.1:3000"
check "http://127.0.0.1:3000/admin"
if systemctl is-active --quiet nginx 2>/dev/null; then check "http://127.0.0.1/"; fi
[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
