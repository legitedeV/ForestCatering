# Backlog

## Part 2 (planned)
- [ ] Full page content (sklep, koszyk, checkout, eventy, galeria, blog, kontakt)
- [ ] Zustand cart store
- [ ] Product listing and detail pages
- [ ] Event packages page
- [ ] Gallery page
- [ ] Blog page
- [ ] Contact page with form
- [ ] Playwright screenshot tests
- [ ] Featured products on homepage
- [ ] Gallery preview on homepage
- [ ] Testimonials section
- [ ] Contact CTA section

## Known Issues

- [ ] **FK inconsistency in `products_images` table**: The `image_id` column is `NOT NULL` but its foreign key uses `ON DELETE set null`. If a Media record is deleted, Postgres will attempt to SET NULL on a NOT NULL column, causing a constraint violation. Fix options: change FK to `ON DELETE cascade` (remove the product_image row when media is deleted) or make `image_id` nullable. This requires a new Payload migration.

## Future
- [ ] Online payments integration
- [ ] Order tracking
- [ ] Newsletter subscription
- [ ] Admin dashboard analytics
- [ ] SEO improvements
- [ ] Performance optimization
- [ ] Standardize build/deploy documentation (CI matrix, env var reference)
