# Architecture — PrestaShop 9 backend-only + Next frontend

## Runtime topology

- **MariaDB**: state for PrestaShop.
- **Redis**: cache/session backend.
- **PrestaShop 9.0.2 (Apache)**: backend-only role in headless setup:
  - `/admin...` for backoffice,
  - `/api...` + `/webservice...` for integrations,
  - front-office redirects to Next frontend domain.
- **Next.js 15 frontend**: single public storefront/UI.
- **Adminer**: optional local DB inspection.

## Headless behavior

Provisioning script `infra/scripts/headless-setup.sh` enforces:

1. webservice account + permissions for API,
2. shop URL normalization to localhost for local dev consistency,
3. `.htaccess` CORS and redirect rules with explicit marker block,
4. no redirect on admin/API/webservice paths,
5. redirect for non-API front-office requests to `FRONTEND_DOMAIN`.

## CI

`/.github/workflows/ci.yml` runs frontend checks and build, then starts Next and executes Playwright screenshot tests. Artifacts are uploaded from:

- `frontend/artifacts/`
- `frontend/playwright-report/`
