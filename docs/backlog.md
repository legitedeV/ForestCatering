# Backlog

## CMS pages
- [x] Custom `SectionReorderPreview` UI in Payload admin → **zrealizowane jako Visual Page Editor v1**
- [ ] Automatyczne generowanie drzewa nawigacji z kolekcji `pages` (`parent`/`sortOrder`) jako alternatywa dla ręcznej konfiguracji w globalu `navigation`.

## Visual Page Editor (v1 shipped ✅)
- [x] Zustand store (`usePageEditorStore`) — zarządzanie stanem edytora
- [x] API route GET/PUT `/api/page-editor/[id]` z auth
- [x] Block metadata catalog z kategoriami
- [x] EditorCanvas z drag & drop (Framer Motion Reorder)
- [x] EditorSidebar z zakładkami (sekcje / edycja / dodaj blok)
- [x] BlockPalette z wyszukiwaniem i filtrami
- [x] BlockFieldEditor — generyczny edytor pól
- [x] EditorToolbar z breakpoint selector i save
- [x] Live preview iframe z postMessage sync
- [x] Przycisk „Otwórz edytor wizualny" w Payload admin

### Visual Page Editor v2 (roadmap)

#### Phase 1 — Editing depth (next)
- [ ] Inline array items editing w sidebar (FAQ/Steps/Pricing/Services/Testimonials/OfferCards/Stats/Team)
- [ ] Nested array editing (np. pricing package → features[])
- [ ] Media picker inline w sidebar (wybór obrazu z kolekcji Media bez wychodzenia do Payload)
- [ ] Edycja `blockName` per-block w sidebar
- [ ] Keyboard shortcuts: Ctrl+S (save), Delete (remove block), Ctrl+D (duplicate)

#### Phase 2 — Visual precision
- [ ] Grid system overlay (konfigurowalne: 12/16 kolumn, snap-to-grid)
- [ ] Auto-alignment guides (smart guides jak w Figma/Sketch)
- [ ] Pixel-perfect positioning: absolute/relative per-element z drag handles
- [ ] Visual resize handles na blokach (padding/margin adjustment via drag)
- [ ] Spacing inspector (wizualizacja marginów/paddingów on hover)

#### Phase 3 — Styling control
- [ ] Color picker per-element (text, background, border, accent)
- [ ] Custom CSS per-block z panelu bocznego
- [ ] Typography controls (font-size, weight, line-height, letter-spacing)
- [ ] Background: solid/gradient/image per-block
- [ ] Border radius / shadow controls per-block

#### Phase 4 — Layout management
- [ ] Layout templates (save/load presetów całych stron)
- [ ] Block templates / snippets (zapisywanie ulubionych konfiguracji bloków)
- [ ] Export/Import layout JSON
- [ ] Multi-page template apply (zastosuj template do wielu stron)

#### Phase 5 — Workflow & collaboration
- [ ] Undo/Redo stack (Ctrl+Z / Ctrl+Shift+Z) z historią akcji
- [ ] Version history diff viewer (porównanie wersji obok siebie)
- [ ] Collaborative editing (WebSocket real-time sync)
- [ ] Comments/annotations na blokach

#### Phase 6 — Advanced
- [ ] Inline text editing (contentEditable bezpośrednio na canvas/preview)
- [ ] Multi-device preview z synchronizowanym scrollem
- [ ] Batch operations (zaznacz wiele bloków → przenieś/usuń/duplikuj)
- [ ] AI assistant do generowania treści bloków
- [ ] Keyboard shortcuts panel (? key — modal z listą skrótów)
- [ ] Accessibility audit per-page (automated checks)

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
