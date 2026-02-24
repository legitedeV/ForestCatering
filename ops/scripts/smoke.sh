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

check_next_assets() {
  local base_url="$1"
  local html

  html=$(curl -sS "$base_url/" 2>/dev/null || true)
  if [[ -z "$html" ]]; then
    echo "❌ $base_url/ → empty response body (cannot parse Next assets)"
    FAIL=1
    return
  fi

  mapfile -t assets < <(printf "%s" "$html" | grep -Eo '/_next/static/[^"[:space:]]+' | sort -u)

  if [[ ${#assets[@]} -eq 0 ]]; then
    echo "❌ $base_url/ → no /_next/static assets found in HTML"
    FAIL=1
    return
  fi

  local checked=0
  for asset in "${assets[@]}"; do
    local url="$base_url$asset"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
    [[ -n "$code" ]] || code="000"

    if [[ "$code" =~ ^(200|304)$ ]]; then
      echo "✅ $url → $code"
    else
      echo "❌ $url → $code"
      FAIL=1
    fi

    checked=$((checked + 1))
    [[ $checked -ge 6 ]] && break
  done
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
check_next_assets "http://127.0.0.1:3000"

if systemctl is-active --quiet nginx 2>/dev/null; then
  for p in "${REQUIRED_PATHS[@]}"; do
    check_required "http://forestbar.pl${p}"
  done
  for p in "${OPTIONAL_CMS_PATHS[@]}"; do
    check_optional "http://forestbar.pl${p}"
  done
  check_next_assets "http://forestbar.pl"
fi

for p in "${REQUIRED_PATHS[@]}"; do
  check_required "https://forestbar.pl${p}"
done
for p in "${OPTIONAL_CMS_PATHS[@]}"; do
  check_optional "https://forestbar.pl${p}"
done
check_next_assets "https://forestbar.pl"

[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
