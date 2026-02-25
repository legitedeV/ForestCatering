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

env_value() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d'=' -f2- || true
}

needs_value() {
  local v="$1"
  [[ -z "$v" || "$v" == CHANGE_ME || "$v" == CHANGE_ME_MIN_32_CHARS ]]
}

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  echo "ℹ️  Created $ENV_FILE from .env.example"
fi

POSTGRES_DB_CURRENT="$(env_value POSTGRES_DB)"
POSTGRES_USER_CURRENT="$(env_value POSTGRES_USER)"
POSTGRES_HOST_CURRENT="$(env_value POSTGRES_HOST)"
POSTGRES_PORT_CURRENT="$(env_value POSTGRES_PORT)"
POSTGRES_PASSWORD_CURRENT="$(env_value POSTGRES_PASSWORD)"
PAYLOAD_SECRET_CURRENT="$(env_value PAYLOAD_SECRET)"
PAYLOAD_REVALIDATE_SECRET_CURRENT="$(env_value PAYLOAD_REVALIDATE_SECRET)"
PAYLOAD_PREVIEW_SECRET_CURRENT="$(env_value PAYLOAD_PREVIEW_SECRET)"

[[ -n "$POSTGRES_DB_CURRENT" ]] || POSTGRES_DB_CURRENT="forestcatering"
[[ -n "$POSTGRES_USER_CURRENT" ]] || POSTGRES_USER_CURRENT="forestcatering"
[[ -n "$POSTGRES_HOST_CURRENT" ]] || POSTGRES_HOST_CURRENT="127.0.0.1"
[[ -n "$POSTGRES_PORT_CURRENT" ]] || POSTGRES_PORT_CURRENT="5432"

if needs_value "$POSTGRES_PASSWORD_CURRENT"; then
  POSTGRES_PASSWORD_CURRENT="$(random_secret)"
  upsert_env "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD_CURRENT"
fi

# Keep DB credentials consistent across setup.sh (role password) and app runtime
DB_URI="postgres://${POSTGRES_USER_CURRENT}:${POSTGRES_PASSWORD_CURRENT}@${POSTGRES_HOST_CURRENT}:${POSTGRES_PORT_CURRENT}/${POSTGRES_DB_CURRENT}"
upsert_env "DATABASE_URL" "$DB_URI"
upsert_env "DATABASE_URI" "$DB_URI"

if needs_value "$PAYLOAD_SECRET_CURRENT"; then
  upsert_env "PAYLOAD_SECRET" "$(random_secret)"
fi

if needs_value "$PAYLOAD_REVALIDATE_SECRET_CURRENT"; then
  upsert_env "PAYLOAD_REVALIDATE_SECRET" "$(random_secret)"
fi

if needs_value "$PAYLOAD_PREVIEW_SECRET_CURRENT"; then
  upsert_env "PAYLOAD_PREVIEW_SECRET" "$(random_secret)"
fi

if ! grep -q '^HOME_PAGE_SLUG=' "$ENV_FILE"; then
  printf '\nHOME_PAGE_SLUG=home\n' >> "$ENV_FILE"
fi

echo "✅ Ensured $ENV_FILE secrets exist and DB credentials are synchronized."
