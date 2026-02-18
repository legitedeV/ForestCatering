#!/usr/bin/env bash
set -euo pipefail

TARGET_HOST="${TARGET_HOST:-51.68.151.159}"
BASE_URL="http://127.0.0.1"

print_headers() {
  local label="$1"
  local cmd="$2"
  echo "=== ${label} (headers first 30 lines) ==="
  bash -lc "$cmd" | head -n 30
}

fail_on_bad_headers() {
  local headers="$1"

  if printf '%s' "$headers" | grep -Eiq '^HTTP/.* 500'; then
    echo "FAIL: detected HTTP 500"
    exit 1
  fi

  if printf '%s' "$headers" | grep -Eiq '^[Ll]ocation: http://localhost'; then
    echo "FAIL: redirect to localhost detected"
    exit 1
  fi

  if printf '%s' "$headers" | grep -Eiq 'localhost'; then
    echo "FAIL: localhost reference detected in headers"
    exit 1
  fi
}

echo "TARGET_HOST=${TARGET_HOST}"
echo "BASE_URL=${BASE_URL}"

front_headers_plain="$(curl -sS -D- -o /dev/null "${BASE_URL}/")"
print_headers "Front / without Host" "curl -sS -D- -o /dev/null '${BASE_URL}/'"
fail_on_bad_headers "$front_headers_plain"

front_headers_host="$(curl -sS -H "Host: ${TARGET_HOST}" -D- -o /dev/null "${BASE_URL}/")"
print_headers "Front / with Host" "curl -sS -H 'Host: ${TARGET_HOST}' -D- -o /dev/null '${BASE_URL}/'"
fail_on_bad_headers "$front_headers_host"

admin_headers="$(curl -sS -H "Host: ${TARGET_HOST}" -D- -o /dev/null "${BASE_URL}/admin-dev/")"
print_headers "Admin /admin-dev/ with Host" "curl -sS -H 'Host: ${TARGET_HOST}' -D- -o /dev/null '${BASE_URL}/admin-dev/'"
fail_on_bad_headers "$admin_headers"
admin_status="$(printf '%s\n' "$admin_headers" | sed -n '1s#.* \([0-9][0-9][0-9]\).*#\1#p')"
if [[ "$admin_status" != "200" && "$admin_status" != "302" ]]; then
  echo "FAIL: admin status is ${admin_status:-unknown}, expected 200 or 302"
  exit 1
fi

front_body="$(curl -sS -H "Host: ${TARGET_HOST}" "${BASE_URL}/")"

echo "=== JSON-LD grep ==="
printf '%s' "$front_body" | grep -F 'application/ld+json'

echo "=== Homepage module markers grep ==="
printf '%s' "$front_body" | grep -E 'fc-hero|fc-section-beige|fc-cta-dark'
printf '%s' "$front_body" | grep -F 'fc-hero' >/dev/null

echo "=== Logs (best effort) ==="
if command -v docker >/dev/null 2>&1; then
  docker compose exec prestashop sh -lc "tail -n 120 /var/www/html/var/logs/*dev*.log 2>/dev/null || true"
  docker compose exec prestashop sh -lc "tail -n 120 /var/log/apache2/error.log 2>/dev/null || true"
else
  echo "docker binary unavailable; skipping docker compose log tails"
fi

echo "OK"
