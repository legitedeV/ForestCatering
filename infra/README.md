# ForestCatering infra baseline (PrestaShop + MariaDB + Redis + Adminer)

## Architecture

PrestaShop 9.0.2 operates as the only application runtime in this repository:
- **PrestaShop** = storefront + admin + API/webservice
- **MariaDB** = data store
- **Redis** = cache/session backend
- **Adminer** = optional local DB inspection

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
3. Configure API/webservice permissions and setup data model:
   ```bash
   ./infra/scripts/headless-setup.sh
   ./infra/scripts/seed-data-model.sh
   ```
4. Reinstall from scratch (DESTROYS volumes):
   ```bash
   ./infra/scripts/wipe.sh --yes-wipe-data
   ```
5. Run base smoke test:
   ```bash
   ./infra/scripts/smoke.sh
   ```
6. Run theme smoke test (boot + apply + verify HTTP/logs):
   ```bash
   ./infra/scripts/smoke-theme.sh
   ```

## API key
Created automatically by `headless-setup.sh`. Resources with full CRUD access:
`products`, `categories`, `combinations`, `customers`, `carts`, `orders`, `order_details`,
`stock_availables`, `carriers`, `addresses`, `countries`, `specific_prices`,
`product_features`, `product_feature_values`, `product_customization_fields`,
`customizations`, `images`, `manufacturers`, `suppliers`, `taxes`.

Test: `curl -s -u '<PS_WEBSERVICE_KEY>:' http://127.0.0.1:8080/api/products?output_format=JSON`

## Deterministic setup logs
- `infra/scripts/headless-setup.sh` is idempotent and schema-aware for `webservice_account` (`key` escaped, `deleted` optional).
- Each run writes `infra/logs/headless-setup-YYYYMMDD-HHMMSS.log`.
- A redacted copy is mirrored to `/var/www/mirror/forestcatering/headless-setup-last.log` (passwords + API key masked).
- Minimal smoke checks are built-in (`DB active=1` + `curl http://127.0.0.1:8080/` returns `200/302`).

## Premium theme: ForestCatering + ForestBar
- Theme source: `infra/theme/forestcatering-premium` (child theme of `classic`).
- Theme apply (no Back Office clicks):
  ```bash
  ./infra/scripts/theme-apply.sh
  ```
