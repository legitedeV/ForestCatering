# Forest Hub

Premium catering & bar website for **Forest Bar** (forestbar.pl).

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 15 (App Router)            |
| CMS          | Payload CMS 3 (PostgreSQL)         |
| Visual CMS   | Builder.io                         |
| Styling      | Tailwind CSS 4                     |
| 3D / Effects | Three.js, GSAP, Framer Motion      |
| Runtime      | Node 22, PM2                       |
| Infra        | Nginx, Let's Encrypt               |

## Getting Started

```bash
# Install dependencies
npm ci

# Copy environment variables
cp ops/.env.example apps/web/.env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start dev server               |
| `npm run build`    | Production build               |
| `npm run lint`     | Run ESLint                     |
| `npm run typecheck`| Run TypeScript type checking   |
| `npm run migrate:web` | Run Payload database migrations |

## Project Structure

```
.
├── apps/
│   └── web/               # Next.js application
│       ├── src/
│       │   ├── app/        # App Router pages & API routes
│       │   ├── components/ # React components
│       │   ├── lib/        # Utilities & clients
│       │   ├── payload/    # Payload CMS config & collections
│       │   ├── hooks/      # Custom React hooks
│       │   ├── styles/     # Global styles
│       │   └── types/      # TypeScript types
│       └── e2e/            # Playwright tests
├── docs/                   # Documentation
├── ops/                    # Operations (nginx, scripts, env)
└── ecosystem.config.cjs    # PM2 configuration
```

## Environment Variables

See [`ops/.env.example`](../ops/.env.example) for the full list of environment variables.

| Variable                          | Required | Description                     |
| --------------------------------- | -------- | ------------------------------- |
| `DATABASE_URI`                    | ✅       | PostgreSQL connection string    |
| `PAYLOAD_SECRET`                  | ✅       | Payload CMS encryption secret   |
| `NEXT_PUBLIC_BUILDER_API_KEY`     | ✅       | Builder.io public API key       |
| `NEXT_PUBLIC_SITE_URL`            | ✅       | Canonical site URL              |
| `NO_INDEX`                        | —        | Disable search engine indexing  |
| `SMTP_HOST` / `SMTP_PORT` / etc. | —        | Email delivery configuration    |
| `NEXT_PUBLIC_ENABLE_3D`           | —        | Enable Three.js 3D effects      |
| `NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR`| —        | Enable custom cursor            |
