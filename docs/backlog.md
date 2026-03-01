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

### Visual Page Editor v2 (backlog)
- [ ] Inline text editing (edycja tekstu bezpośrednio na canvas klikając w treść)
- [ ] Visual resize handles na blokach (zmiana wysokości/padding)
- [ ] Custom CSS per-block z panelu bocznego
- [ ] Undo/Redo stack (Ctrl+Z / Ctrl+Shift+Z)
- [ ] Version history diff viewer (porównanie wersji obok siebie)
- [ ] Multi-device preview toggle z synchronizowanym scrollem
- [ ] Batch operations (zaznacz wiele bloków → przenieś/usuń/duplikuj)
- [ ] Block templates / snippets (zapisywanie ulubionych konfiguracji bloków)
- [ ] Collaborative editing (WebSocket real-time sync)
- [ ] AI assistant do generowania treści bloków
- [ ] Export/Import layout JSON
- [ ] Keyboard shortcuts panel (? key)
- [ ] Edycja array items (items/packages/steps) bezpośrednio w sidebar

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
