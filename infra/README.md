# ForestCatering infra baseline (PrestaShop + MariaDB + Nginx)

## Quick start
1. Generate deterministic secrets once:
   ```bash
   ./infra/gen-secrets.sh
   ```
2. Start stack:
   ```bash
   ./infra/scripts/up.sh
   ```
3. Reinstall from scratch (DESTROYS volumes):
   ```bash
   ./infra/scripts/wipe.sh --yes-wipe-data
   ```
4. Run smoke test:
   ```bash
   ./infra/scripts/smoke.sh
   ```

## Nginx IP-only reverse proxy
```bash
cp infra/nginx/forestcatering-ip.conf /etc/nginx/sites-available/forestcatering-ip
ln -sfn /etc/nginx/sites-available/forestcatering-ip /etc/nginx/sites-enabled/forestcatering-ip
nginx -t && systemctl reload nginx
```

## Operational scripts
- `infra/scripts/install-docker.sh`: idempotent Docker installation.
- `infra/scripts/up.sh`: resolve latest stable PrestaShop image and start stack.
- `infra/scripts/down.sh`: stop stack.
- `infra/scripts/status.sh`: show compose status.
- `infra/scripts/wipe.sh --yes-wipe-data`: remove containers + volumes and reinstall cleanly.
- `infra/scripts/smoke.sh`: validates compose, service health, egress, DB integrity, HTTP response and exports logs.
- `infra/scripts/backup-db.sh`: exports MariaDB dump as `.sql.gz` in `/home/forest/artifacts`.
- `infra/scripts/restore-db.sh <dump.sql.gz>`: restores DB dump.
- `infra/scripts/export-files.sh`: exports PrestaShop volume as `.tar.gz`.
- `infra/scripts/export-full-backup.sh`: produces combined backup tarball with metadata.

## Notes
- Persistent data uses Docker named volumes: `mariadb_data`, `redis_data`, `prestashop_data`.
- Backend network is internal-only; PrestaShop joins backend + edge to keep DB private while allowing Internet egress for language packs.
- Logs for every run are stored under `infra/logs/run-<timestamp>/`.
- Backup artifacts are stored under `/home/forest/artifacts` and excluded from git.
