#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="${1:-$PROJECT_ROOT/ops/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Canonical DB variable: DATABASE_URL (compat with existing code that reads DATABASE_URI)
if [[ -z "${DATABASE_URL:-}" && -n "${DATABASE_URI:-}" ]]; then
  export DATABASE_URL="$DATABASE_URI"
fi
if [[ -z "${DATABASE_URI:-}" && -n "${DATABASE_URL:-}" ]]; then
  export DATABASE_URI="$DATABASE_URL"
fi

required_vars=(
  DATABASE_URL
  PAYLOAD_SECRET
  PAYLOAD_REVALIDATE_SECRET
  PAYLOAD_PREVIEW_SECRET
  HOME_PAGE_SLUG
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "❌ Missing required env var after loading $ENV_FILE: $var_name" >&2
    exit 1
  fi
done
