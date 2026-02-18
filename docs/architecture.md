# Architecture — PrestaShop 9 stack

## Runtime topology

- **MariaDB**: state for PrestaShop.
- **Redis**: cache/session backend.
- **PrestaShop 9.0.2 (Apache)**: storefront, admin (`/admin...`) and API/webservice (`/api...`, `/webservice...`).
- **Adminer**: optional local DB inspection.

## Provisioning behavior

Provisioning script `infra/scripts/headless-setup.sh` enforces:

1. webservice account + permissions for API,
2. shop URL normalization to localhost for local dev consistency,
3. deterministic idempotent SQL updates.

## CI

`/.github/workflows/ci.yml` runs infrastructure script syntax validation for the Presta-only stack.
