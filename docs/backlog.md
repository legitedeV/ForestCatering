# Backlog

Items discovered during Next.js frontend bootstrap but deferred to keep PR scope minimal.

## Deferred
- [ ] Server-side cart integration (POST /api/carts) — currently client-side localStorage only
- [ ] Order placement flow (POST /api/orders) — requires payment integration
- [ ] Product images via PrestaShop image API (/api/images/products/{id})
- [ ] SEO: dynamic meta tags, Open Graph, structured data
- [ ] i18n: multi-language support beyond Polish
- [ ] Nginx config: update forestcatering-ip.conf to proxy /frontend routes
- [ ] CI/CD: GitHub Actions for lint + build + test
- [ ] E2E tests with Playwright
- [ ] PWA configuration (service worker, manifest)
- [ ] Rate limiting on API client
- [ ] Image optimization pipeline (next/image with PS image proxy)
