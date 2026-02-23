#!/usr/bin/env bash
set -euo pipefail

OPS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$OPS_DIR/.env"
EXAMPLE_FILE="$OPS_DIR/.env.example"

random_secret() {
  openssl rand -base64 48 | tr -d '/+=' | cut -c1-48
}

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  echo "ℹ️  Created $ENV_FILE from .env.example"
fi

PG_PASS=$(random_secret)
PAYLOAD_SECRET=$(random_secret)
PAYLOAD_REVALIDATE_SECRET=$(random_secret)
PAYLOAD_PREVIEW_SECRET=$(random_secret)

upsert_env "POSTGRES_PASSWORD" "$PG_PASS"

if grep -q '^DATABASE_URI=' "$ENV_FILE"; then
  sed -i "s|^DATABASE_URI=.*|DATABASE_URI=postgres://forestcatering:${PG_PASS}@127.0.0.1:5432/forestcatering|" "$ENV_FILE"
else
  printf '\nDATABASE_URI=postgres://forestcatering:%s@127.0.0.1:5432/forestcatering\n' "$PG_PASS" >> "$ENV_FILE"
fi

upsert_env "PAYLOAD_SECRET" "$PAYLOAD_SECRET"
upsert_env "PAYLOAD_REVALIDATE_SECRET" "$PAYLOAD_REVALIDATE_SECRET"
upsert_env "PAYLOAD_PREVIEW_SECRET" "$PAYLOAD_PREVIEW_SECRET"

if ! grep -q '^HOME_PAGE_SLUG=' "$ENV_FILE"; then
  printf '\nHOME_PAGE_SLUG=home\n' >> "$ENV_FILE"
fi

echo "✅ Updated $ENV_FILE with generated secrets (idempotent upsert)."
