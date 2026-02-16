# ForestCatering infra baseline (PrestaShop + MariaDB + Nginx)

## Architecture

PrestaShop 9.0.2 operates as a **headless backend**:
- **PrestaShop** = backend (products, prices, orders, customers, payments, API)
- **Next.js** = frontend (separate application, not in this repo)
- Front-office rendering is disabled; all storefront routes return JSON 404 or redirect to the Next.js app.

Two product types are supported:
- **retail** – standard products with stock management
- **event** – configurable packages priced per-person, with customization fields (number of guests, date, time, address, notes)

Products are tagged with `business_type` feature (`retail` or `event`) and organized into category trees (`Menu` for retail, `Eventy` for events).

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
3. **Configure headless backend** (API, features, categories):
   ```bash
   ./infra/scripts/headless-setup.sh
   ```
4. Start Next.js frontend:
   ```bash
   cd frontend && npm install && npm run dev
   ```
   Or via Docker Compose:
   ```bash
   docker compose --env-file infra/.env -f infra/compose.yml up frontend
   ```
5. Reinstall from scratch (DESTROYS volumes):
   ```bash
   ./infra/scripts/wipe.sh --yes-wipe-data
   ```
6. Run base smoke test:
   ```bash
   ./infra/scripts/smoke.sh
   ```
7. Run headless smoke test:
   ```bash
   ./infra/scripts/smoke-headless.sh
   ```
8. Run theme smoke test (boot + apply + verify HTTP/logs):
   ```bash
   ./infra/scripts/smoke-theme.sh
   ```

## Headless Mode Setup

Po pierwszym `./scripts/up.sh` i ukończeniu instalacji PrestaShop:

1. Uruchom konfigurację headless:
   ```bash
   ./scripts/headless-setup.sh
   ```

2. Załaduj model danych (features, kategorie, przykładowe produkty):
   ```bash
   ./scripts/seed-data-model.sh
   ```

3. Zweryfikuj konfigurację:
   ```bash
   ./scripts/smoke-headless.sh
   ```

## Headless mode

### What is enabled
| Route pattern | Purpose |
|---|---|
| `/admin*` | Back-office panel |
| `/api/*` | Webservice REST API |
| `/module/*/payment` | Payment webhook callbacks |
| Static assets (`/img`, `/js`, `/css`, …) | Admin UI resources |

### What is disabled
All other front-office routes return:
```json
{"error":"front-office disabled","message":"This PrestaShop instance runs in headless mode. Use the Next.js frontend."}
```
In production, switch to `return 301` in `infra/nginx/forestcatering-ip.conf` to redirect to `FRONTEND_DOMAIN`.

### API key
Created automatically by `headless-setup.sh`. Resources with full CRUD access:
`products`, `categories`, `combinations`, `customers`, `carts`, `orders`, `order_details`,
`stock_availables`, `carriers`, `addresses`, `countries`, `specific_prices`,
`product_features`, `product_feature_values`, `product_customization_fields`,
`customizations`, `images`, `manufacturers`, `suppliers`, `taxes`.

Test: `curl -s -u '<PS_WEBSERVICE_KEY>:' http://127.0.0.1:8080/api/products?output_format=JSON`

### Event products
To configure an existing product as an event package:
```bash
./infra/scripts/headless-add-event-product.sh <id_product> [min_qty]
```
This adds customization fields (number of guests, date, time, address, notes), sets minimal quantity, and assigns `business_type=event`.

### Data model
```
Feature: business_type
  ├── retail  (Menu → Lunch boxy, Kanapki, Sałatki, Napoje)
  └── event   (Eventy → Lunch biznesowy, Bankiet premium, Regeneracyjne, ForestBar)
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
- `infra/scripts/headless-setup.sh`: configure PrestaShop as headless backend (API key, redirect frontu, CORS).
- `infra/scripts/seed-data-model.sh`: seed modelu danych (feature business_type, kategorie, przykładowe produkty).
- `infra/scripts/headless-add-event-product.sh <id>`: add event customization fields to a product.
- `infra/scripts/smoke-headless.sh`: validates headless configuration (API, features, categories, admin access).
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
