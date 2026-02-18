# ForestCatering — local runbook

## 1) Generate secrets

```bash
bash infra/gen-secrets.sh
```

## 2) Start stack

```bash
docker compose --env-file infra/.env -f infra/compose.yml up -d --build
```

## 3) Provision PrestaShop to headless mode

```bash
bash infra/scripts/headless-setup.sh
```

## 4) Run smoke tests

```bash
bash infra/scripts/smoke.sh
bash infra/scripts/smoke-headless.sh
```

## 5) Useful status commands

```bash
docker compose --env-file infra/.env -f infra/compose.yml ps
docker compose --env-file infra/.env -f infra/compose.yml logs --no-color --tail=200 prestashop
```

## Notes

- PrestaShop is local-only in dev: `127.0.0.1:8080`.
- Adminer is local-only in dev: `127.0.0.1:8081`.
- PrestaShop serves storefront, admin panel, and API/webservice in a single stack.
