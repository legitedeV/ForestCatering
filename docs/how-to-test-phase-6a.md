# How to Test Phase 6A — Visual Editor v2 Improvements

## Prerequisites

1. `cd apps/web && npm install`
2. Set up `.env.local` with `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_EDITOR_SECRET`, `SMTP_HOST`
3. Run database migrations: `npx payload migrate`
4. Start dev server: `npm run dev`

---

## A. Style Overrides + Accent Color (P1+P2 fix)

1. Open `/page-editor/{page-id}` (e.g. the "home" page)
2. Click on a Hero block to select it
3. In the sidebar → **Styl** tab → **Kolory** section
4. Set **Text Color** to `#FF0000`
5. In the preview iframe: the `h1` and `p` inside the Hero should turn red
6. Set **Accent Color** to `#00FF00`
7. Buttons with `bg-accent*` classes should turn green

**Expected:** CSS injection via `[data-block-id="..."] h1, ... { color: ... !important }` overrides Tailwind

---

## B. CSS Animation Vars (P3 fix — shimmer/breathe/float speed control)

1. Select any block → **Animacja** tab in sidebar
2. Choose **Shimmer** animation
3. Set **Czas trwania (ms)** to `4000`
4. Preview: shimmer should be noticeably slower than default 2s
5. Set to `800` → shimmer should be faster
6. Try **Float** animation with `10000ms` (slow float) vs `3000ms` (fast float)
7. Test **Easing** select: choose `linear` vs `ease-in-out` — behavior should differ
8. Test **Iteracje** select: choose `1` → animation plays once; `infinite` → loops

**Expected:** `--ve-anim-duration` CSS custom property on wrapper propagates to `::after` pseudo-element

---

## C. Production Animations (P4 fix)

1. Configure animation on a block (e.g. **Fade Up Soft** on a Stats block)
2. Save the page
3. Open the public URL (e.g. `/oferta`) in a new tab
4. Scroll to the block — it should animate in on scroll

**Expected:** `BlockRendererClient` uses IntersectionObserver to add `.visible` class

---

## D. Payload Schema Persistence (P5 fix)

1. Set `animation: "shimmer"`, `animationDuration: 3000`, `animationEasing: "linear"` on a block
2. Save the page (Ctrl+S)
3. Reload the page editor
4. Re-open the block's animation panel — values should still be set

**Expected:** All 19 block schemas now include `animation`, `animationDuration`, `animationDelay`, `animationEasing`, `animationIterations`, `styleOverrides` via `visualEditorFields()`

---

## E. Inline Text Editing

1. In the editor toolbar (or sidebar), enable **Inline Edit** mode (if toggle exists) OR proceed directly to double-click
2. In the preview iframe, double-click on any `h1` heading in a Hero block
3. The heading should become editable (ring border appears, floating label shows "✏️ Edytujesz: Nagłówek")
4. Type some text
5. Press `Enter` to commit (or click outside)
6. The sidebar field should update automatically
7. Press `Escape` to cancel and revert

---

## F. Batch Operations (Multi-select)

1. In the **EditorCanvas** (left sidebar block list), hold `Ctrl` and click on 2+ blocks
2. The blocks should highlight in amber/gold color
3. A **BatchActionsBar** should appear at the bottom of the canvas
4. Click **Duplikuj** → duplicates of selected blocks appear
5. Click **Usuń** → confirm → selected blocks are deleted
6. Click × in BatchActionsBar to deselect all

---

## G. Keyboard Shortcuts Panel

1. Make sure focus is NOT in an input field
2. Press `?` on the keyboard
3. A modal should appear showing all keyboard shortcuts grouped by category
4. Press `Escape` or `?` again to close
5. Click the ⌨️ button in the toolbar to open/close

---

## H. AnimationPicker Extended Controls

1. Select any block with a continuous animation (Shimmer, Float, Breathe, etc.)
2. In the **Animacja** section:
   - **Czas trwania**: now accepts 200–30000ms (was 300–2000)
   - **Easing**: dropdown with `ease-in-out`, `linear`, `ease-in`, `ease-out`, `spring`
   - **Iteracje**: dropdown with `infinite`, `1`, `2`, `3`, `5`
3. Verify changes reflect immediately in preview

---

## Unit Tests

```bash
cd apps/web
npx playwright test e2e/visual-editor.spec.ts --project=chromium
```

These are unit tests (no browser navigation) that test `generateBlockScopedCss` and `generateAllBlocksCss` logic directly.

---

## Notes

- After adding new fields to Payload block schemas, a **database migration is required** in production:
  ```bash
  npx payload migrate:create add-visual-editor-animation-fields
  npx payload migrate
  ```
- Animations now work on **production pages** via `BlockRendererClient` wrapper (previously only in page editor preview)
- The `--ve-anim-*` CSS custom properties are inherited by `::after` pseudo-elements (fixes shimmer duration control)
