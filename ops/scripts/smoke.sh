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

check_homepage_static_assets() {
  local base_url="$1"
  local html css_path js_path

  html=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$base_url/" 2>/dev/null || true)
  if [[ -z "$html" ]]; then
    echo "❌ ${base_url}/ → cannot fetch homepage HTML for static asset checks"
    FAIL=1
    return
  fi

  css_path=$(printf '%s' "$html" | grep -oE '/_next/static/[^"[:space:]]+\.css' | head -n1 || true)
  js_path=$(printf '%s' "$html" | grep -oE '/_next/static/[^"[:space:]]+\.js' | head -n1 || true)

  if [[ -z "$css_path" ]]; then
    echo "❌ ${base_url}/ → no CSS asset reference found in homepage HTML"
    FAIL=1
  else
    check_required "${base_url}${css_path}"
  fi

  if [[ -z "$js_path" ]]; then
    echo "❌ ${base_url}/ → no JS asset reference found in homepage HTML"
    FAIL=1
  else
    check_required "${base_url}${js_path}"
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
  check_required "https://forestbar.pl${p}"
done
for p in "${OPTIONAL_CMS_PATHS[@]}"; do
  check_optional "https://forestbar.pl${p}"
done
check_homepage_static_assets "https://forestbar.pl"

[[ $FAIL -eq 0 ]] || { echo "🔥 SMOKE FAILED"; exit 1; }
echo "🎉 All smoke tests passed."
