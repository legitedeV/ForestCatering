# ForestCatering Infra Foundation (PrestaShop-ready, no app yet)

This folder prepares core infrastructure for a future PrestaShop 9.x deployment over server IP only.
No PrestaShop container is installed in this stage.

## What is included
- Docker Compose stack with:
  - `mariadb:10.11` (persistent volume + healthcheck)
  - `redis:7-alpine` (persistent volume + healthcheck)
  - optional `adminer:4` exposed only on `127.0.0.1:8081`
- Operational scripts for lifecycle, smoke tests, backups, restore, and mirror publication.
- Nginx scaffold for future reverse proxy on IP (`server_name _`).
- Optional systemd unit template for auto-start on boot.

## Directory layout
```text
infra/
  compose.yml
  .env.example
  gen-secrets.sh
  README.md
  scripts/
    install-docker.sh
    up.sh
    down.sh
    status.sh
    smoke.sh
    backup-db.sh
    restore-db.sh
    rotate-backups.sh
    publish-mirror.sh
  nginx/
    ip-only.conf
  systemd/
    forestcatering-infra.service
  logs/
  backups/
```

## 1) Install Docker on Debian 13
```bash
cd /workspace/ForestCatering/infra
./scripts/install-docker.sh
```

## 2) Generate secrets
Secrets must exist only in `infra/.env`.
```bash
cd /workspace/ForestCatering/infra
./gen-secrets.sh
# use ./gen-secrets.sh --force only when you intentionally rotate credentials
```

Template: `infra/.env.example`.

## 3) Start / stop / status
```bash
cd /workspace/ForestCatering/infra
./scripts/up.sh
./scripts/status.sh
./scripts/down.sh
```

## 4) Smoke tests and logs
Run the full validation suite:
```bash
cd /workspace/ForestCatering/infra
./scripts/smoke.sh
```

Smoke test does all of the following:
1. validates `docker compose config`
2. starts services
3. waits for healthy `mariadb` + `redis`
4. runs DB create/insert/select/drop test
5. runs redis ping
6. records versions
7. creates backup and rotates backups
8. writes compose diagnostics (`ps`, logs tail)
9. publishes all artifacts to mirror

Logs are written under:
- local: `infra/logs/run-<timestamp>/`
- mirror: `/var/www/mirror/forestcatering-infra/<timestamp>/`

## 5) SSH port-forward examples
Adminer is local-only on server loopback:
```bash
ssh -L 8081:127.0.0.1:8081 user@server
```
Then open locally:
- `http://127.0.0.1:8081`

No database port is published on host interfaces.

## 6) Backups / restore
Create DB backup:
```bash
cd /workspace/ForestCatering/infra
./scripts/backup-db.sh
```

Rotate daily backups (keep last 14 by default):
```bash
./scripts/rotate-backups.sh
```

Restore from explicit file:
```bash
./scripts/restore-db.sh /workspace/ForestCatering/infra/backups/mariadb-backup-YYYYmmdd-HHMMSS.sql.gz
```

## 7) Mirror publication
`smoke.sh` automatically calls `scripts/publish-mirror.sh`.
You can publish manually:
```bash
./scripts/publish-mirror.sh /workspace/ForestCatering/infra/logs/run-YYYYmmdd-HHMMSS
```

## 8) Optional systemd autostart
Install unit (adjust paths if repo location differs):
```bash
cp /workspace/ForestCatering/infra/systemd/forestcatering-infra.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now forestcatering-infra.service
```

## 9) Nginx scaffold (not enabled automatically)
Config: `infra/nginx/ip-only.conf`
- listens on `80`
- `server_name _;`
- proxies to future app at `http://127.0.0.1:8080`

Enable later when app exists:
```bash
cp /workspace/ForestCatering/infra/nginx/ip-only.conf /etc/nginx/sites-available/forestcatering-ip
ln -s /etc/nginx/sites-available/forestcatering-ip /etc/nginx/sites-enabled/forestcatering-ip
nginx -t && systemctl reload nginx
```

## Future step (when domain is ready)
- Add PrestaShop service to compose.
- Route Nginx to app container/process.
- Add TLS (Let's Encrypt) and secure redirects.
