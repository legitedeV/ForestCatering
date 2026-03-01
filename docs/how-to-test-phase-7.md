# How to Test Phase 7 — Template per-page + CSS Overlay Editor

## Prerequisites
- Database running (PostgreSQL)
- Run migration: `npm run -w apps/web migrate`
- Start dev server: `npm run dev`

## Manual Test Steps

### 1. Template per-page persistence
1. Open `/page-editor/{id}` → click "Styl" tab in sidebar
2. Select template "B — Glass Forest" from the Template section
3. Click Save (Ctrl+S)
4. Reload the editor page
5. **Expected**: Template "B — Glass Forest" is still selected

### 2. CSS Overlay Editor
1. In the "Styl" tab, expand "📝 CSS Overlay (persist)" section
2. Select "Globals" tab (should be default)
3. Type CSS: `h1 { text-shadow: 0 0 20px rgba(212,168,83,0.5); }`
4. **Expected**: In preview iframe, headings get a warm glow effect
5. Switch to "Layout" tab
6. Type CSS: `.container { border: 2px dashed red; }`
7. **Expected**: Layout containers get a red dashed border in preview
8. Click "↩ Reset" to clear current overlay
9. Click "📋 Export" to copy overlay to clipboard

### 3. Overlay Persistence
1. Type a CSS overlay in the Globals tab
2. Save the page (Ctrl+S)
3. Reload the editor
4. **Expected**: The overlay text is still present

### 4. Production CSS Overlays (Feature Flag)
1. Open the page's normal URL (e.g., `/about`)
2. **Expected**: No overlay styles applied (feature flag is off by default)
3. Set `NEXT_PUBLIC_ENABLE_CSS_OVERLAYS=true` in `.env`
4. Restart dev server
5. **Expected**: Overlay styles now visible on the production page

### 5. Theme Polish
1. Tab through interactive elements (buttons, links)
2. **Expected**: Focus-visible outline uses accent-warm color (#D4A853)
3. Check `.gradient-line` elements — animation should work
4. Check `.btn-ripple` buttons — focus-visible outline present
5. Check `.floating-stats` — smooth transition on transform/opacity

### 6. Automated Tests
```bash
# Unit tests (Playwright)
npx playwright test src/lib/__tests__/page-editor-store-persist.test.ts
npx playwright test e2e/template-css-overlay.spec.ts
```
