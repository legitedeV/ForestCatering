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

#### Phase 1 — Editing depth ✅
- [x] Inline array items editing w sidebar (FAQ/Steps/Pricing/Services/Testimonials/OfferCards/Stats/Team)
- [x] Nested array editing (np. pricing package → features[])
- [x] Media picker inline w sidebar (wybór obrazu z kolekcji Media bez wychodzenia do Payload)
- [x] Keyboard shortcuts: Ctrl+S (save), Delete (remove block), Ctrl+D (duplicate)
- [x] Edycja `blockName` per-block w sidebar
#### Phase 2 — Visual precision
- [x] Grid system overlay (konfigurowalne: 12/16/24 kolumn, rulers, snap-to-grid)
- [ ] Auto-alignment guides (smart guides jak w Figma/Sketch) → **Phase 3 PR**
- [ ] Pixel-perfect positioning: absolute/relative per-element z drag handles → **Phase 3 PR**
- [ ] Visual resize handles na blokach (padding/margin adjustment via drag) → **Phase 3 PR**
- [x] Spacing inspector (wizualizacja marginów/paddingów on hover)

#### Phase 3 — Styling control ✅
- [x] Color picker per-element (text, background, border, accent) — CSS variables override w panelu Styl
- [x] Animation picker per-block (30+ animacji CSS/Framer Motion z preview)
- [x] Custom CSS per-block z panelu bocznego (animation classes)
- [x] Custom CSS per-page (advanced editor w panelu Styl)
- [x] Typography controls (font-size, weight, line-height, letter-spacing)
- [x] Background: solid/gradient/image per-block
- [x] Border radius / shadow controls per-block
- [x] Block visibility per-breakpoint
- [x] Style presets (save/load per-block konfiguracji)

#### Phase 4 — Layout management
- [x] Layout templates (save/load presetów całych stron) — template selector A-E w panelu Styl
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

#### Phase 7 — Style system (backlog)
- [ ] Per-block CSS class picker (wybór klas CSS z globals.css per-block)
- [ ] CSS variables persistence w bazie (pole `cssOverrides` na Page document)
- [ ] Full globals.css editor strona standalone (`/page-editor/css`)
- [ ] Template preview thumbnails (screenshot-based)
- [ ] Template export/import (JSON z CSS overrides)

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

- [x] **FK inconsistency in `products_images` table**: Fixed in migration `20260301_200000` — changed FK to `ON DELETE cascade`.

## Future
- [ ] Online payments integration
- [ ] Order tracking
- [ ] Newsletter subscription
- [ ] Admin dashboard analytics
- [ ] SEO improvements
- [ ] Performance optimization
- [ ] Standardize build/deploy documentation (CI matrix, env var reference)
