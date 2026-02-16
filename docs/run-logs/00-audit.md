# Etap 0 — Audit repo + baseline

## Struktura (najważniejsze)

### infra/
- `infra/compose.yml`
- `infra/.env.example`
- `infra/gen-secrets.sh`
- `infra/scripts/common.sh`
- `infra/scripts/headless-setup.sh`
- `infra/scripts/smoke.sh`
- `infra/scripts/up.sh`
- `infra/scripts/down.sh`

### frontend/
- `frontend/package.json`
- `frontend/Dockerfile`
- `frontend/.env.example`
- `frontend/src/app/page.tsx`
- `frontend/src/lib/prestashop/client.ts`
- `frontend/src/lib/prestashop/categories.ts`
- `frontend/src/lib/prestashop/products.ts`

## Obecne entrypointy i routing

- PrestaShop jest publikowany na `127.0.0.1:8080` (compose port mapping).
- Frontend Next.js jest publikowany na `127.0.0.1:3000`.
- Adminer jest publikowany na `127.0.0.1:8081`.
- Aktualna konfiguracja PrestaShop używa `PS_DOMAIN=${SERVER_IP}` i `PS_HANDLE_DYNAMIC_DOMAIN=0`, co może wymuszać redirect na IP.
- `headless-setup.sh` dokłada reguły `.htaccess` i przekierowuje front-office na `FRONTEND_DOMAIN`, z wyjątkami dla `/admin`, `/api`, `/webservice` i callbacków payment.

## Ryzyka

1. **Redirect 302/301 na IP** — ustawienie `PS_DOMAIN` na `SERVER_IP` + statyczna konfiguracja domeny sklepu powoduje niestabilne zachowanie na localhost.
2. **Konflikty `.htaccess`** — kolejne uruchomienia mogą dublować lub nadpisywać reguły jeśli markery nie są konsekwentne.
3. **CORS niepełny** — nagłówki CORS są ustawiane warunkowo dla `/api|/webservice`, ale brak centralnego smoke testu dla preflight + auth.
4. **Skrypt smoke zbyt rozbudowany i zależny od egress** — obecny `smoke.sh` testuje DNS/HTTP do zewnętrznego API i mutuje `.env` image digest; to nie jest deterministyczny smoke headless.
5. **Sekrety** — obecny `gen-secrets.sh` jest jednorazowy (jeśli `.env` istnieje, kończy pracę), zamiast uzupełniać brakujące klucze idempotentnie.

