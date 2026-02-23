# Homepage + pełna edycja stron w CMS — status wdrożenia

## Status faz
- ✅ **Faza 1 (catch-all route):** wdrożona (`/(site)/[...slug]`) z pobieraniem stron z kolekcji `pages`, `draftMode()`, SEO metadata i `notFound()`.
- ✅ **Faza 2 (migracja stron hardcoded):** wdrożona dla `/oferta`, `/eventy`, `/galeria`, `/kontakt`, `/regulamin` — strony renderują bloki CMS, seed tworzy/aktualizuje dokumenty.
- ✅ **Faza 3 (parent/child pages):** wdrożona (`parent`, `sortOrder` w kolekcji `pages`; seed ustawia relacje stron pod `home`).
- ✅ **Faza 5 (live preview breakpoints):** wdrożona (`mobile/tablet/desktop` w `admin.livePreview`).
- ⏳ **Faza 4 (custom visual reorder UI):** odłożona do backlogu, bo natywny drag&drop bloków Payload już działa.

## Wdrożone bloki CMS
- Istniejące: `hero`, `stats`, `services`, `featuredProducts`, `about`, `richText`, `gallery`, `testimonials`, `cta`, `faq`.
- Nowe: `pricing`, `steps`, `contactForm`, `legalText`, `galleryFull`.

## Bezpieczeństwo i workflow
- Preview nadal wymaga poprawnego `PAYLOAD_PREVIEW_SECRET`.
- Draft content jest serwowany tylko w `draftMode()`.
- Revalidate po publikacji pozostaje aktywne przez hook `revalidatePages`.
- Rich text renderowany przez renderer Lexical (`@payloadcms/richtext-lexical/react`).
