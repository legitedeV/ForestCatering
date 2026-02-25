# ForestCatering Ops Runbook (deterministic monorepo deploy)

This repository is operated as one npm workspace monorepo.

## Canonical paths

- **Dependencies (single tree):** `node_modules/` at repository root.
- **App source:** `apps/web`.
- **Build output (single canonical location):** `apps/web/.next`.
- **Standalone runtime:** `apps/web/.next/standalone/apps/web/server.js`.
- **Production env source of truth:** `ops/.env`.
- **Deploy scripts:** `ops/scripts/*`.

## 0) One-time setup

```bash
cp ops/.env.example ops/.env
# edit ops/.env with real values
```

Required variables: `DATABASE_URL`, `PAYLOAD_SECRET`, `PAYLOAD_REVALIDATE_SECRET`, `PAYLOAD_PREVIEW_SECRET`, `HOME_PAGE_SLUG`.

> `DATABASE_URI` is kept as compatibility alias, but `DATABASE_URL` is the canonical key.

## 1) Local production-like build (single command)

From repository root:

```bash
npm run build:web
```

What this does (always in same order):

1. Loads env from `ops/.env`.
2. Runs `npm ci` from root (workspace install).
3. Runs Payload migrations for `apps/web`.
4. Runs `next build` for `apps/web`.
5. Prepares standalone runtime artifacts:
   - copies `apps/web/.next/static` → `apps/web/.next/standalone/apps/web/.next/static`
   - copies `apps/web/public` → `apps/web/.next/standalone/apps/web/public`
   - validates `.next/static/chunks` is non-empty.

## 2) Run app locally (standalone runtime)

```bash
cd /path/to/ForestCatering
set -a && source ops/.env && set +a
node apps/web/.next/standalone/apps/web/server.js
```

## 3) CMS migrations and seed

### Migrations only

```bash
npm run migrate:web
```

### Seed

```bash
cd apps/web
set -a && source ../../ops/.env && set +a
npm run seed
```

## 4) Production deploy + PM2 restart (single command)

```bash
bash ops/scripts/deploy.sh
```

Deploy script guarantees:

1. Loads `ops/.env`.
2. Runs unified pipeline (`npm run build:web`).
3. Verifies standalone server exists.
4. Verifies standalone static chunk files exist.
5. Restarts PM2 using standalone server and standalone cwd.
6. Uses `--update-env` so PM2 runtime matches `ops/.env`.

PM2 command used by deploy:

```bash
pm2 delete forestcatering || true
pm2 start apps/web/.next/standalone/apps/web/server.js \
  --name forestcatering \
  --cwd apps/web/.next/standalone/apps/web \
  -i max \
  --update-env
pm2 save
```

## 5) Safe PM2 operations

```bash
pm2 status
pm2 logs forestcatering
pm2 restart forestcatering --update-env
```

## 6) Rules that prevent drift

- Do **not** run production builds outside `apps/web/.next`.
- Do **not** use nested `apps/web/node_modules`.
- Do **not** keep production secrets in `apps/web/.env*`.
- Always deploy through `ops/scripts/deploy.sh`.
