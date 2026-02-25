# 🌲 Forest Catering

Profesjonalna firma cateringowa ze Szczecina — Next.js 15 + Payload CMS 3 + PostgreSQL 16.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router, TypeScript) |
| CMS | Payload CMS 3 (embedded) |
| Database | PostgreSQL 16 |
| Styling | Tailwind CSS 4 |
| Process mgr | PM2 |
| Reverse proxy | nginx |

## Local Development

1. Generate secrets:
   ```bash
   bash ops/scripts/gen-secrets.sh
   ```

2. Install PostgreSQL 16, create DB from `ops/.env`

3. Install, load env, and run:
   ```bash
   npm install        # from repo root (workspace install)
   set -a; source ops/.env; set +a
   cd apps/web
   npm run dev
   ```

4. Open:
   - Site: http://localhost:3000
   - Admin: http://localhost:3000/admin



For commands that need Payload + DB (e.g. `npm run migrate`, `npm run seed`, `npm run diag:db`), load env first in the same shell:

```bash
set -a; source ops/.env; set +a
```

### Preview + revalidate secrets

`ops/.env` must define:

- `PAYLOAD_PREVIEW_SECRET`
- `PAYLOAD_REVALIDATE_SECRET`
- `HOME_PAGE_SLUG` (default: `home`)

Generate missing values idempotently (existing secrets are preserved). Script also synchronizes `DATABASE_URI` with `POSTGRES_*` values to prevent DB auth drift:

```bash
bash ops/scripts/gen-secrets.sh
```

Manual revalidate smoke test:

```bash
BODY='{"collection":"pages","slug":"home"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$PAYLOAD_REVALIDATE_SECRET" -binary | xxd -p -c 256)
curl -i -X POST http://localhost:3000/api/revalidate   -H 'Content-Type: application/json'   -H "x-payload-signature: $SIG"   --data "$BODY"
```

## Project Structure

```
apps/web/           — Next.js + Payload app
  src/
    app/            — Next.js routes
    payload/        — Collections, globals, blocks, hooks
    components/     — UI + layout components
    lib/            — Utilities (email, format, payload-client)
ops/                — Deploy scripts, nginx config, env
docs/               — Documentation
```

## Deployment

```bash
bash ops/scripts/deploy.sh
```

## CI

Build + lint + typecheck + bash syntax validation runs on every PR and push to main.

## Domain & SSL

The production domain is **forestbar.pl**.

### DNS Requirements

| Type | Name | Value |
|------|------|-------|
| A    | forestbar.pl | `<VPS_IP>` |
| A    | www.forestbar.pl | `<VPS_IP>` |
| AAAA | forestbar.pl | `<VPS_IPv6>` (optional) |
| AAAA | www.forestbar.pl | `<VPS_IPv6>` (optional) |

### First-time SSL setup

```bash
# 1. Ensure DNS is propagated
dig forestbar.pl +short   # should return your VPS IP

# 2. Run one-time SSL setup
bash ops/scripts/setup-ssl.sh

# 3. Update ops/.env
sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://forestbar.pl|' ops/.env

# 4. Rebuild and restart
cd apps/web && npm run build
pm2 restart forestcatering

# 5. Verify
curl -I https://forestbar.pl
```

Certificate auto-renews via cron (`certbot renew`). nginx reloads automatically after renewal.

## How to test (local)

```bash
# 1. Install all dependencies from repo root (single lockfile)
npm install

# 2. Production build of apps/web
cd apps/web && npm run build

# 3. Lint check
npm run lint
```

> **Note:** The build requires `DATABASE_URI`, `PAYLOAD_SECRET`, and `NEXT_PUBLIC_SITE_URL`
> environment variables. Pages that query PostgreSQL will log connection errors during static
> generation if no database is running — this is expected and does not fail the build.

### Testing blog content rendering

1. Seed demo data (idempotent):
   ```bash
   cd apps/web && npm run seed
   ```
2. Start the app and open a post page:
   ```bash
   cd apps/web && npm run dev
   # then open /blog/startujemy-z-blogiem-forest-catering
   ```
3. Verify rendering and safety:
   - rich text nodes (np. `h2`, `strong`, `ul > li`) są renderowane jako HTML, nie surowy tekst,
   - fallback HTML (jeśli wpis zawiera string HTML) jest sanitizowany,
   - payloady `<script>` i atrybuty `on*` są usuwane.

Renderer znajduje się w `apps/web/src/components/blog/RichTextRenderer.tsx` i obsługuje zarówno Lexical JSON z Payload, jak i bezpieczny fallback dla HTML string.
