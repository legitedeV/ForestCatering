# Backlog

## Running database migrations

Payload CMS migrations live in `apps/web/src/migrations/`.

```bash
# From the repository root (uses ops/scripts/run-migrations-web.sh):
npm run migrate:web

# Or directly from the web workspace:
npm run -w apps/web migrate
```

> **Note:** Do NOT use `npx run migrate` — this is not a valid way to run
> package.json scripts. Use `npm run` (or `pnpm run`) instead.

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

#### Phase 5 — Workflow & collaboration (partial ✅)
- [x] Undo/Redo stack (Ctrl+Z / Ctrl+Shift+Z) z Command Pattern + historią akcji sesji
- [x] Version history diff viewer (Payload versions + structural diff) — PR #5B
- [x] Optimistic concurrency (conflict detection + resolution dialog) — PR #5B
- [x] Comments/annotations na blokach (localStorage + piny preview) — PR #5B
- [ ] Collaborative editing (WebSocket real-time sync) → **wymaga infra, osobny PR**

#### Phase 6 — Advanced (Phase 6A ✅, Phase 6B ✅)
- [x] **Style override fix**: Scoped CSS injector (`block-style-injector.ts`) overcomes Tailwind utility specificity — PR #6A
- [x] **accentColor support**: CSS injection targets `[class*="bg-accent"]`, `[class*="text-accent"]` etc. — PR #6A
- [x] **CSS animation var-based control**: `--ve-anim-duration/delay/easing/iter` custom properties on wrapper propagate to `::after` (shimmer) — PR #6A
- [x] **Production animations**: `BlockRendererClient` with IntersectionObserver fires `.visible` class on scroll-in for production pages — PR #6A
- [x] **Payload schema persists animation fields**: `animation`, `animationDuration`, `animationDelay`, `animationEasing`, `animationIterations` added to all 19 blocks via `visualEditorFields()` — PR #6A
- [x] **Inline text editing**: Double-click on `h1`/`h2`/`p` in preview activates `contentEditable`, sends `preview:inline-edit` postMessage — PR #6A
- [x] **Batch operations**: Ctrl+click multi-select in EditorCanvas + BatchActionsBar (duplicate/delete) — PR #6A
- [x] **Keyboard shortcuts panel**: `?` key opens modal, `Escape` closes — PR #6A
- [x] **AnimationPicker**: Easing select + Iterations select + extended duration range (200–30000ms) — PR #6A
- [x] **E2E unit tests**: `e2e/visual-editor.spec.ts` tests `generateBlockScopedCss` / `generateAllBlocksCss` — PR #6A
- [x] **AI assistant (offline-first)**: Template-based content generation per block/field/tone, optional LLM fallback — PR #6B
- [x] **Multi-device split preview**: 2-3 iframes (desktop/tablet/mobile) with sync scroll — PR #6B
- [x] **Accessibility audit**: DOM-based checks in preview iframe, motion checks, panel with severity grouping — PR #6B

> **Note**: AI LLM integration optional — set `AI_API_KEY` + `AI_API_URL` in env

#### Phase 7 — Style system ✅
- [x] Template per-page selection (persisted in Payload `pageTemplate` field)
- [x] CSS overlay editor (globals + layout, persisted in Payload)
- [x] Production CSS overlays (feature flag: `NEXT_PUBLIC_ENABLE_CSS_OVERLAYS`)
- [x] Theme polish: focus-visible, gradient-line var, btn-ripple focus, floating-stats transition

> **Note**: CSS overlays work in editor immediately. For production, set `NEXT_PUBLIC_ENABLE_CSS_OVERLAYS=true`

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
