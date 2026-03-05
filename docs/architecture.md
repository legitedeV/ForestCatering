# Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Browser     │────▶│  Nginx       │────▶│  Next.js (PM2)  │
│  (Client)    │◀────│  Reverse     │◀────│  Port 3000      │
└─────────────┘     │  Proxy       │     └────────┬────────┘
                    └──────────────┘              │
                                          ┌───────┴───────┐
                                          │               │
                                    ┌─────▼─────┐  ┌──────▼──────┐
                                    │ Payload    │  │ Builder.io  │
                                    │ CMS        │  │ Visual CMS  │
                                    └─────┬──────┘  └─────────────┘
                                          │
                                    ┌─────▼──────┐
                                    │ PostgreSQL  │
                                    └────────────┘
```

## Component Hierarchy

```
App (layout.tsx)
├── (admin)/admin         → Payload CMS dashboard
├── api/
│   ├── [...payload]      → Payload REST API
│   └── builder           → Builder.io webhook handler
└── (site)/
    ├── page.tsx           → Homepage (Three.js hero, sections)
    ├── catering/          → Catering page
    ├── bar/               → Bar page
    ├── wesela/            → Weddings page
    ├── eventy/            → Events page
    ├── kontakt/           → Contact page
    └── [...page]          → Builder.io catch-all pages
```

## Data Flow

### Payload CMS → Next.js → Client

1. Content editors manage data via Payload admin panel (`/admin`)
2. Payload stores data in PostgreSQL
3. Next.js server components fetch data via Payload Local API
4. Pages are rendered server-side and streamed to the client
5. Client-side hydration activates interactive components (3D, animations)

### Builder.io Integration

1. Visual content is created in Builder.io dashboard
2. Builder.io content is fetched at build/request time via SDK
3. The `[...page]` catch-all route renders Builder.io pages
4. Webhook (`/api/builder`) triggers on-demand revalidation
5. Custom components (HeroSimple, ServicesGrid, etc.) are registered for use in Builder

## Key Design Decisions

- **Dual CMS**: Payload for structured data (menus, bookings), Builder.io for marketing pages
- **App Router**: Leverages React Server Components for optimal performance
- **PM2**: Process management with zero-downtime reloads in production
- **Standalone output**: Next.js standalone build for minimal Docker/server footprint
