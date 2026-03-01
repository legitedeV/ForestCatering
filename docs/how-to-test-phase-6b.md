# How to test Phase 6B

## AI Content Assistant (offline-first)

1. Otwórz Visual Page Editor (`/page-editor/<id>`)
2. Wybierz blok (np. Hero, CTA, Pricing, Services, About, ContactForm)
3. Przy polach tekstowych (nagłówek, podnagłówek, tekst przycisku itp.) — kliknij przycisk ✨
4. Otworzy się popover z sugestiami AI
5. Zmień ton (Profesjonalny / Przyjazny / Premium) — sugestie się odświeżą
6. Kliknij "Użyj" przy dowolnej sugestii — pole zostanie zaktualizowane
7. Kliknij "Generuj nowe" — nowe losowe sugestie z szablonów

**Bez env vars** (`AI_API_KEY`, `AI_API_URL`):
- Szablony templateów muszą działać poprawnie (offline-first)
- Każda kombinacja blok/pole/ton powinna zwrócić 3 sugestie

**Z env vars** (opcjonalnie):
- Jeśli API zwróci wynik — sugestie z LLM (`source: 'llm'`)
- Jeśli API timeout/error — fallback do szablonów

## Multi-device Split Preview

1. Otwórz Visual Page Editor → przejdź do "Podgląd na żywo"
2. Kliknij przycisk "Split" (ikona 3 prostokątów) w toolbarze
3. Powinny pojawić się 3 iframe obok siebie: Desktop (1440px), Tablet (768px), Mobile (375px)
4. Każdy iframe jest skalowany do dostępnej przestrzeni
5. **Scroll sync**: przewiń w jednym iframe → pozostałe powinny się zsynchronizować
6. Kliknij ponownie "Split" → powrót do pojedynczego iframe

## Accessibility Audit

1. Otwórz Visual Page Editor → przejdź do "Podgląd na żywo"
2. Kliknij przycisk "♿" (A11y) w toolbarze
3. Otworzy się panel "Audyt dostępności" po prawej stronie
4. Kliknij "Uruchom ponownie" — audyt DOM preview iframe
5. Wyniki pogrupowane: błędy (czerwone), ostrzeżenia (żółte), informacje (szare)
6. Kliknięcie issue z `blockIndex` → zaznacza i scrolluje do bloku

**Sprawdzane reguły:**
- `img-alt`: Obraz bez atrybutu alt
- `link-text`: Link bez tekstu lub aria-label
- `button-text`: Przycisk bez tekstu lub aria-label
- `input-label`: Pole formularza bez labela
- `single-h1`: Więcej niż 1 element h1
- `heading-order`: Pominięty poziom nagłówka
- `tabindex`: tabindex > 0
- `html-lang`: Brak atrybutu lang na `<html>`
- `motion-duration`: Animacja szybsza niż 800ms

## Testy

```bash
# Unit tests (AI templates)
cd apps/web && npx playwright test src/lib/__tests__/ai-content-templates.test.ts

# E2E smoke tests
cd apps/web && npx playwright test e2e/split-preview-a11y.spec.ts
```
