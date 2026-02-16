<<<<<<< HEAD
# ForestCatering infra baseline (PrestaShop + MariaDB + Nginx)

## Jednolinijkowy bootstrap (clean machine)
```bash
cd infra && ./scripts/smoke-theme.sh
```

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
4. Run base smoke test:
   ```bash
   ./infra/scripts/smoke.sh
   ```
5. Run theme smoke test (boot + apply + verify HTTP/logs):
   ```bash
   ./infra/scripts/smoke-theme.sh
   ```

## Premium theme: ForestCatering + ForestBar
- Theme source: `infra/theme/forestcatering-premium` (child theme of `classic`).
- Theme apply (no Back Office clicks):
  ```bash
  ./infra/scripts/theme-apply.sh
  ```
- Brand mode switch (Catering / Bar): toggle is in the top sticky header.
- Content editing:
  - homepage sections: `infra/theme/forestcatering-premium/templates/index.tpl`
  - palette + motion tokens: `infra/theme/forestcatering-premium/assets/css/theme.css`
  - interactions and brand switch logic: `infra/theme/forestcatering-premium/assets/js/theme.js`

## Deterministic raster assets policy
- No JPG/PNG/WebP binaries are committed to git.
- `infra/scripts/theme-assets-install.sh` downloads source photos from `assets.sources.json`, validates SHA-256, converts to webp and installs into the running PrestaShop theme.
- Generated inventory: `infra/theme/forestcatering-premium/assets-manifest.json`.
- License summary: `infra/theme/forestcatering-premium/SOURCES.md`.

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
- `infra/scripts/smoke-theme.sh`: full test of theme deployment and storefront health (HTTP 200 + no PHP fatal logs).
- `infra/scripts/theme-apply.sh`: syncs theme, installs assets, sets default theme and default PL language.
- `infra/scripts/theme-assets-install.sh`: deterministic assets downloader/converter with sha256 validation.
- `infra/scripts/backup-db.sh`: exports MariaDB dump as `.sql.gz` in `/home/forest/artifacts`.
- `infra/scripts/restore-db.sh <dump.sql.gz>`: restores DB dump.
- `infra/scripts/export-files.sh`: exports PrestaShop volume as `.tar.gz`.
- `infra/scripts/export-full-backup.sh`: produces combined backup tarball with metadata.

## Troubleshooting
- **Brak kontenerów / błąd compose:** uruchom `./infra/scripts/up.sh`, a następnie `docker compose --env-file infra/.env -f infra/compose.yml ps`.
- **Błąd assets installer (sha mismatch):** źródłowy plik zdjęcia zmienił się; zaktualizuj `assets.sources.json` tylko po ponownym potwierdzeniu licencji i nowym checksum.
- **Brak języka PL:** `theme-apply.sh` kończy się błędem, jeśli `ps_lang` nie zawiera `iso_code='pl'`. Sprawdź auto-instalację PrestaShop i zmienne środowiskowe `PS_LANGUAGE=pl`.
- **Uprawnienia motywu:** jeśli cache/rendering jest nieaktualny, wykonaj `docker compose --env-file infra/.env -f infra/compose.yml restart prestashop`.

## Notes
- Persistent data uses Docker named volumes: `mariadb_data`, `redis_data`, `prestashop_data`.
- Backend network is internal-only; PrestaShop joins backend + edge to keep DB private while allowing Internet egress for language packs.
- Logs for every run are stored under `infra/logs/run-<timestamp>/`.
- Backup artifacts are stored under `/home/forest/artifacts` and excluded from git.
=======
# ForestCatering infra

## PrestaShop theme activation (`forestcatering-premium`)

1. Ensure the stack is running:
   ```bash
   cd infra
   docker compose --env-file .env -f compose.yml up -d
   ```
2. The theme is mounted to `/var/www/html/themes/forestcatering-premium` by `compose.yml`.
3. Repair locale/shop DB metadata if needed:
   ```bash
   ./scripts/fix-prestashop-db.sh
   ```
4. In Back Office, go to **Design → Theme & Logo**, then activate **Forest Catering Premium**.
5. Clear cache after activation:
   ```bash
   docker compose --env-file .env -f compose.yml exec prestashop sh -lc 'rm -rf /var/www/html/var/cache/*'
   ```

## Smoke runbook

Run:

```bash
cd infra
./scripts/smoke.sh
```

Logs are written to `infra/logs/run-<timestamp>/`.
>>>>>>> 7c90fc3a (docs(infra): document runbook for repair/theme activation)
