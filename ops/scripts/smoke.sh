#!/usr/bin/env bash
set -euo pipefail
FAIL=0

check_required() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
  [[ -n "$code" ]] || code="000"
  if [[ "$code" =~ ^(200|301|302)$ ]]; then
    echo "✅ $url → $code"
  else
    echo "❌ $url → $code"
    FAIL=1
  fi
}

check_optional() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
  [[ -n "$code" ]] || code="000"
  if [[ "$code" =~ ^(200|301|302)$ ]]; then
    echo "✅ $url → $code"
  elif [[ "$code" == "404" ]]; then
    echo "⚠️ $url → $code (optional CMS route not published)"
  else
    echo "❌ $url → $code"
    FAIL=1
  fi
}

REQUIRED_PATHS=(
  "/"
  "/admin"
  "/api/pages"
  "/sklep"
  "/blog"
  "/koszyk"
  "/polityka-prywatnosci"
)

OPTIONAL_CMS_PATHS=(
  "/oferta"
  "/eventy"
  "/galeria"
  "/kontakt"
  "/regulamin"
)

for p in "${REQUIRED_PATHS[@]}"; do
  check_required "http://127.0.0.1:3000${p}"
done
for p in "${OPTIONAL_CMS_PATHS[@]}"; do
  check_optional "http://127.0.0.1:3000${p}"
done

if systemctl is-active --quiet nginx 2>/dev/null; then
  for p in "${REQUIRED_PATHS[@]}"; do
    check_required "http://forestbar.pl${p}"
  done
  for p in "${OPTIONAL_CMS_PATHS[@]}"; do
    check_optional "http://forestbar.pl${p}"
  done
fi

for p in "${REQUIRED_PATHS[@]}"; do
  check_required "https://forestbar.pl${p}"
done
for p in "${OPTIONAL_CMS_PATHS[@]}"; do
  check_optional "https://forestbar.pl${p}"
done

[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
