# ForestCatering Infra (PrestaShop 9 over IP)

This folder contains a Docker Compose stack for ForestCatering infrastructure with PrestaShop 9.x exposed over server IP (no domain/TLS yet).

## What is included
- Docker Compose stack with:
  - `mariadb:10.11` (persistent volume + healthcheck)
  - `redis:7-alpine` (persistent volume + healthcheck)
  - `adminer:4` exposed only on `127.0.0.1:8081`
  - `prestashop/prestashop:9.0-apache` exposed on `127.0.0.1:8080`
- Operational scripts for lifecycle, smoke tests, backups, restore, and mirror publication.
- Nginx scaffold for host-level reverse proxy on IP only (`server_name _`).
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
    backup-files.sh
    restore-files.sh
    rotate-backups.sh
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

## 4) Access endpoints (IP-only)
- Via host Nginx (after enabling `infra/nginx/ip-only.conf`):
  - `http://<SERVER_IP>/`
- Direct debug access to PrestaShop container (loopback only):
  - `http://127.0.0.1:8080`
- Adminer loopback only:
  - `http://127.0.0.1:8081`

PrestaShop admin bootstrap credentials are in `infra/.env`:
- `PRESTASHOP_ADMIN_EMAIL`
- `PRESTASHOP_ADMIN_PASSWORD`

## 5) Smoke tests and logs
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
6. verifies `http://127.0.0.1:8080/` and stores HTML artifact
7. records versions
8. creates DB + PrestaShop files backups and rotates backups
9. writes compose diagnostics (`ps`, logs tail)
10. publishes all artifacts to mirror

Logs are written under:
- local: `infra/logs/run-<timestamp>/`
- mirror: `/var/www/mirror/forestcatering-infra/run-<timestamp>/`

## 6) SSH port-forward examples
Adminer is local-only on server loopback:
```bash
ssh -L 8081:127.0.0.1:8081 user@server
```
Then open locally:
- `http://127.0.0.1:8081`

No database port is published on host interfaces.

## 7) Backups / restore
Create DB backup:
```bash
cd /workspace/ForestCatering/infra
./scripts/backup-db.sh
```

Restore DB from explicit file:
```bash
./scripts/restore-db.sh /workspace/ForestCatering/infra/backups/mariadb-backup-YYYYmmdd-HHMMSS.sql.gz
```

Create PrestaShop files backup (`prestashop_data` named volume):
```bash
./scripts/backup-files.sh
```

Restore PrestaShop files backup:
```bash
./scripts/restore-files.sh /workspace/ForestCatering/infra/backups/prestashop-files-YYYYmmdd-HHMMSS.tar.gz
```

Rotate daily backups (keep last 14 by default):
```bash
./scripts/rotate-backups.sh
```

## 8) Mirror publication
`smoke.sh` automatically calls `scripts/publish-mirror.sh`.
You can publish manually:
```bash
./scripts/publish-mirror.sh /workspace/ForestCatering/infra/logs/run-YYYYmmdd-HHMMSS
```

## 9) Optional systemd autostart
Install unit (adjust paths if repo location differs):
```bash
cp /workspace/ForestCatering/infra/systemd/forestcatering-infra.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now forestcatering-infra.service
```

## 10) Nginx scaffold (not enabled automatically)
Config: `infra/nginx/ip-only.conf`
- listens on `80`
- `server_name _;`
- serves mirror index under `/mirror/` from `/var/www/mirror/`
- proxies app traffic to `http://127.0.0.1:8080`

Enable when ready:
```bash
cp /workspace/ForestCatering/infra/nginx/ip-only.conf /etc/nginx/sites-available/forestcatering-ip
ln -s /etc/nginx/sites-available/forestcatering-ip /etc/nginx/sites-enabled/forestcatering-ip
nginx -t && systemctl reload nginx
```

## Future step
- Add TLS (Let's Encrypt) once a domain is available.
