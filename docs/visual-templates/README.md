# Forest Catering — Visual Templates (Proposals A-E)

This directory contains detailed visual templates for each UI/UX proposal. Each template documents the design patterns, CSS classes, color tokens, and reusable code snippets that can be easily copied and applied to other pages/subpages.

## Templates

| Template | Style | Currently Applied To |
|----------|-------|---------------------|
| [A — Organic Warmth](./template-a-organic-warmth.md) | Warm gold, noise textures, floating elements | Home page (`/`) |
| [B — Glass Forest](./template-b-glass-forest.md) | Glass morphism, background orbs | Offer (`/oferta`), Pricing (`/pakiety`) |
| [C — Modern Editorial](./template-c-modern-editorial.md) | Sticky filters, quick-view overlay | Shop (`/sklep`) |
| [D — Product Showcase](./template-d-product-showcase.md) | Image gallery, tabs, breadcrumbs | Product detail (`/sklep/[slug]`) |
| [E — Enhanced Navigation](./template-e-enhanced-navigation.md) | Warm nav, cart pulse, scroll-to-top | **Permanent** (entire site) |

## Global CSS Utilities

All templates share global CSS utilities defined in `apps/web/src/app/globals.css`:

- `.gradient-line` — Animated gradient underline
- `.noise-overlay` — Subtle noise texture
- `.glass-card` — Frosted glass card effect
- `.warm-glow` — Golden glow on hover
- `.bg-orbs` — Background gradient blobs
- `.product-scroll` — Horizontal scrollable container
- `.bento-grid` — Asymmetric grid layout
- `.btn-ripple` — Button ripple hover effect
- `.floating-stats` — Floating stats bar
- `.timeline-connector` — Horizontal timeline line
- `.reveal-stagger` — Scroll-triggered stagger animation

## Color Palette (New)

| Token | Value | Usage |
|-------|-------|-------|
| `accent-warm` | `#D4A853` | Primary warm gold |
| `accent-warm-light` | `#E8C97A` | Hover state |
| `accent-warm-dark` | `#B08A3A` | Dark variant |
| `forest-green` | `#4A7C59` | Green accent |
| `forest-green-light` | `#5E9A6F` | Light green |
| `forest-green-dark` | `#3A6247` | Dark green |

## Shared Components

| Component | File | Used In |
|-----------|------|---------|
| `Breadcrumbs` | `components/ui/Breadcrumbs.tsx` | Templates D, E |
| `ScrollToTop` | `components/ui/ScrollToTop.tsx` | Template E |
| `ProductImageGallery` | `components/shop/ProductImageGallery.tsx` | Template D |
| `ProductTabs` | `components/shop/ProductTabs.tsx` | Template D |
| `useScrollReveal` | `hooks/useScrollReveal.ts` | Scroll animations |
