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

3. Install and run:
   ```bash
   npm install        # from repo root (workspace install)
   cd apps/web
   npm run dev
   ```

4. Open:
   - Site: http://localhost:3000
   - Admin: http://localhost:3000/admin

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
