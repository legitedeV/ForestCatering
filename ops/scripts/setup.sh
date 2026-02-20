#!/usr/bin/env bash
set -euo pipefail

echo "=== Forest Catering — VPS Setup ==="

# Node.js 20
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node: $(node -v)"

# PM2
if ! command -v pm2 &>/dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
fi

# PostgreSQL 16
if ! command -v psql &>/dev/null; then
  echo "Installing PostgreSQL 16..."
  sudo apt-get install -y postgresql-16
fi

# nginx
if ! command -v nginx &>/dev/null; then
  echo "Installing nginx..."
  sudo apt-get install -y nginx
fi

# Create PG user and database (idempotent)
if command -v psql &>/dev/null; then
  PG_USER="${POSTGRES_USER:-forestcatering}"
  PG_DB="${POSTGRES_DB:-forestcatering}"
  PG_PASS="${POSTGRES_PASSWORD:-changeme}"

  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'" \
    | grep -q 1 || sudo -u postgres psql -c "CREATE ROLE ${PG_USER} WITH LOGIN PASSWORD '${PG_PASS}';"

  # Always sync password to match ops/.env (handles regenerated secrets)
  sudo -u postgres psql -c "ALTER ROLE ${PG_USER} WITH PASSWORD '${PG_PASS}';" 2>/dev/null || true

  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'" \
    | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE ${PG_DB} OWNER ${PG_USER};"
fi

# Create directories
mkdir -p "$(cd "$(dirname "$0")/../.." && pwd)/ops/logs"

echo "✅ Setup complete."
