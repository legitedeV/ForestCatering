#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

if [[ -f "$ENV_FILE" ]]; then
  echo "⚠️  $ENV_FILE already exists. Not overwriting."
  exit 0
fi

PG_PASS=$(openssl rand -base64 24 | tr -d '/+=')
PAYLOAD_SECRET=$(openssl rand -base64 48 | tr -d '/+=')

cp "$(cd "$(dirname "$0")/.." && pwd)/.env.example" "$ENV_FILE"

sed -i "s|POSTGRES_PASSWORD=CHANGE_ME|POSTGRES_PASSWORD=${PG_PASS}|g" "$ENV_FILE"
sed -i "s|CHANGE_ME@127|${PG_PASS}@127|g" "$ENV_FILE"
sed -i "s|PAYLOAD_SECRET=CHANGE_ME_MIN_32_CHARS|PAYLOAD_SECRET=${PAYLOAD_SECRET}|g" "$ENV_FILE"

echo "✅ Generated $ENV_FILE with random secrets."
