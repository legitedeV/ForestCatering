# Analiza: edycja całej strony głównej + preview przed publikacją (Payload CMS + Next.js)

## 1) Stan obecny (audyt repo)

### Frontend (Next.js App Router)
- Strona główna (`apps/web/src/app/(site)/page.tsx`) jest w większości hardcoded w komponencie i tylko sekcja bestsellerów jest dynamicznie pobierana z Payload (`products`).
- Brak dynamicznego renderingu bloków CMS dla `/` (homepage nie korzysta z kolekcji `pages`).
- Brak draft preview route dla treści strony głównej.

### Payload CMS
- Jest kolekcja `pages` z polami `title`, `slug`, `sections` (blocks) i `seo`.
- Dostępne bloki: `hero`, `richText`, `gallery`, `cta`, `faq`.
- To już dobra baza pod „full editable homepage”, ale aktualny frontend `/` nie korzysta z tej kolekcji.

### Blog / rich text
- `posts.content` to `richText` (Lexical), więc poprawna ścieżka renderowania to `@payloadcms/richtext-lexical/react`.
- Renderer bloga używa teraz Lexical renderer i fallback dla empty/unknown content.

## 2) Luki funkcjonalne względem celu

1. **Homepage nie jest CMS-driven**
   - redaktor nie ma możliwości edycji całej strony głównej z panelu i publikacji zmian jednym workflow.

2. **Brak preview draftu przed publikacją**
   - brak mechanizmu „zobacz draft” dla strony głównej (token + draft mode + route preview).

3. **Brak wersjonowania zmian contentu dla strony głównej**
   - edytor nie ma wygodnego punktu cofania/review (w Payload można to dodać przez versions + drafts).

4. **Brak spójnego renderera bloków pages na froncie**
   - jest schema CMS, ale brakuje warstwy mapowania blockType -> komponent UI dla `/`.

## 3) Rekomendowana architektura docelowa

## A. Model treści (Payload)
1. Traktować homepage jako dokument `pages` ze `slug = home`.
2. Włączyć `versions` + `drafts` dla `pages`, np.:
   - `versions: { drafts: true, maxPerDoc: 50 }`.
3. Doprecyzować bloki pod istniejący layout homepage:
   - `hero` (badge, heading, subheading, CTA primary/secondary, media),
   - `services-grid` (kafelki usług),
   - `featured-products` (sekcja dynamiczna z filtrami),
   - `about` (sekcja „O nas”),
   - `testimonials` (opinie),
   - `gallery-preview`,
   - `cta-banner`.
4. Dodać walidacje redakcyjne:
   - limity liczby elementów,
   - required fields,
   - spójność linków (internal vs external),
   - fallbacki media/alt.

## B. Rendering frontend
1. Wydzielić `PageBlocksRenderer` (server component):
   - `switch(blockType)` -> konkretne komponenty sekcji.
2. Zmienić `/` tak, by:
   - pobierał `pages` po `slug=home`,
   - renderował `sections` przez `PageBlocksRenderer`,
   - zachował fallback na obecny hardcoded home tylko gdy brak dokumentu CMS.
3. Zapewnić bezpieczny rendering rich text w blokach tekstowych przez Lexical renderer.

## C. Preview (draft mode)
1. Dodać endpoint preview, np. `/api/preview?slug=/&secret=...`:
   - walidacja sekretu,
   - `draftMode().enable()`,
   - redirect na docelowy slug.
2. W query do Payload dla strony głównej uwzględnić draft mode:
   - gdy draft enabled: `draft: true`.
3. Dodać route wyłączenia preview: `/api/preview/disable`.
4. W panelu Payload skonfigurować `livePreview`/`preview` URL dla `pages`.

## D. Workflow redakcyjny
1. Edytor zmienia stronę `home` w CMS.
2. Klik „Podgląd” -> otwiera stronę w draft mode.
3. Akceptacja -> publikacja.
4. Po publikacji strona publiczna korzysta z wersji published.

## E. QA / testy
1. E2E dla homepage CMS:
   - render sekcji z `pages.slug=home`,
   - draft preview działa i nie wycieka bez secret.
2. Smoke:
   - `/` zwraca 200,
   - `/api/preview` z dobrym i złym sekretem.
3. Security:
   - brak niekontrolowanego HTML injection,
   - brak publicznego dostępu do draftów bez preview.

## 4) Plan wdrożenia etapami

### Etap 1 (bezpieczny, mały)
- Dodać `PageBlocksRenderer` i podpiąć homepage do `pages.slug=home` + fallback na stary layout.

### Etap 2
- Włączyć drafts/versions dla `pages`.
- Dodać preview endpoints + sekrety env + konfigurację URL preview.

### Etap 3
- Rozszerzyć bloki CMS, aby 1:1 pokryć obecne sekcje strony głównej.

### Etap 4
- E2E (draft/public) + docs dla content team.

## 5) Ryzyka i decyzje techniczne

1. **Hydration/performance**: bloki renderować jako Server Components, client tylko tam, gdzie interakcje.
2. **SEO**: metadata homepage brać z `pages.seo`.
3. **Cache/revalidate**: po publikacji revalidate homepage (webhook lub manual trigger).
4. **Migracja contentu**: pierwszy seed `home` powinien zmapować obecny układ do bloków, aby uniknąć pustej strony.

## 6) Szybkie rekomendacje operacyjne

- Dodać `HOME_PAGE_SLUG=home` do konfiguracji.
- Wprowadzić `PAYLOAD_PREVIEW_SECRET` do `.env.example`.
- Przygotować seed tworzący/aktualizujący dokument `pages/home`.
- Po wdrożeniu: checklista redakcyjna „co sprawdzić przed publikacją”.
