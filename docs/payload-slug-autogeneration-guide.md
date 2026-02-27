# Payload CMS 3 + Next.js: automatyczne i edytowalne slugi / nazwy plików

Ten dokument pokazuje wzorzec produkcyjny dla Payload CMS v3, w którym:

- slug / imageSlug / fileName są **autogenerowane**,
- ale nadal są **ręcznie edytowalne** w adminie,
- unikalność jest zapewniana przez hook (`-1`, `-2`, ...),
- działa to dla zwykłych kolekcji i uploadów (`originalFilename`).

---

## 1) Plan implementacji

1. **Utwórz współdzielony util do slugify** (`slugifySafe`) z normalizacją diakrytyków i fallbackiem.
2. **Utwórz hook factory** `generateAutoSlug(...)` dla `beforeValidate`.
3. W hooku:
   - generuj slug **tylko gdy pole slug jest puste**,
   - jeżeli użytkownik wpisał slug ręcznie → **nie nadpisuj**,
   - zawsze sanitizuj wartość,
   - sprawdź unikalność w kolekcji i dopisz suffix.
4. **Podłącz hook do kolekcji** (`posts`, `pages`, `media`, itd.).
5. (Opcjonalnie) Dodaj **komponent admin UI** do live podpowiedzi, ale input ma pozostać zwykłym edytowalnym polem.
6. W Next.js użyj slugów w dynamic routes (`app/[slug]/page.tsx`) i fetchuj po `where: { slug: { equals: ... } }`.
7. Dodaj testy regresyjne dla przypadków: fallback, ręczna edycja, unikalność, upload.

---

## 2) Util slugify (TypeScript)

Plik: `apps/web/src/payload/lib/slug.ts`

```ts
export type SlugifyOptions = {
  maxLength?: number
}

/**
 * SEO-safe slug:
 * - lowercase
 * - usuwa diakrytyki (NFD)
 * - zamienia whitespace/underscores na "-"
 * - usuwa znaki specjalne
 * - redukuje wielokrotne "-"
 */
export const slugifySafe = (input: string, options: SlugifyOptions = {}): string => {
  const maxLength = options.maxLength ?? 80

  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // spaces/underscores -> '-'
    .replace(/[^a-z0-9-]+/g, '-') // remove special chars (regex requested)
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return ''
  return slug.slice(0, maxLength).replace(/-+$/g, '')
}

export const stripFileExtension = (filename: string): string =>
  filename.replace(/\.[^.]+$/, '')
```

> Regex bazowy do slugów: `replace(/[^a-z0-9-]+/g, '-')`.

---

## 3) Hook factory: `generateAutoSlug`

Plik: `apps/web/src/payload/hooks/generateAutoSlug.ts`

```ts
import type { CollectionBeforeValidateHook } from 'payload'
import { slugifySafe, stripFileExtension } from '../lib/slug'

type SourceResolver = string | ((ctx: { data: Record<string, unknown>; originalDoc?: Record<string, unknown> | null }) => unknown)

type GenerateAutoSlugArgs = {
  slugField?: string
  sourceFields?: SourceResolver[]
  fallbackPrefix?: string
  maxLength?: number
}

const toStringSafe = (value: unknown): string => (typeof value === 'string' ? value : '')

const resolveSource = (
  resolver: SourceResolver,
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown> | null,
): string => {
  if (typeof resolver === 'function') return toStringSafe(resolver({ data, originalDoc }))

  const fromData = toStringSafe(data[resolver])
  if (fromData) return fromData

  const fromOriginal = toStringSafe(originalDoc?.[resolver])
  return fromOriginal
}

const uniqueSlug = async ({
  baseSlug,
  collectionSlug,
  req,
  docId,
}: {
  baseSlug: string
  collectionSlug: string
  req: any
  docId?: string | number
}): Promise<string> => {
  let candidate = baseSlug
  let index = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where: Record<string, unknown> = {
      slug: { equals: candidate },
    }

    const result = await req.payload.find({
      collection: collectionSlug,
      where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
      pagination: false,
    })

    const takenByOtherDoc = result.docs.some((doc: { id: string | number }) => String(doc.id) !== String(docId ?? ''))
    if (!takenByOtherDoc) return candidate

    index += 1
    candidate = `${baseSlug}-${index}`
  }
}

export const generateAutoSlug = ({
  slugField = 'slug',
  sourceFields = ['title', 'name', 'originalFilename'],
  fallbackPrefix = 'resource',
  maxLength = 80,
}: GenerateAutoSlugArgs = {}): CollectionBeforeValidateHook => {
  return async ({ data, originalDoc, req, collection }) => {
    if (!data) return data

    const typedData = data as Record<string, unknown>
    const currentRaw = toStringSafe(typedData[slugField])

    // Jeśli user wpisał ręcznie -> nie nadpisuj, tylko sanitizuj.
    if (currentRaw.trim()) {
      typedData[slugField] = slugifySafe(currentRaw, { maxLength })
      return typedData
    }

    // Fallback chain: title -> name -> originalFilename (bez rozszerzenia) -> timestamp
    const rawSource =
      sourceFields
        .map((source) => resolveSource(source, typedData, originalDoc as Record<string, unknown> | null))
        .find(Boolean) ?? ''

    const preparedSource =
      rawSource === toStringSafe(typedData.originalFilename)
        ? stripFileExtension(rawSource)
        : rawSource

    const base =
      slugifySafe(preparedSource, { maxLength }) ||
      `${fallbackPrefix}-${Date.now()}`

    typedData[slugField] = await uniqueSlug({
      baseSlug: base,
      collectionSlug: collection.slug,
      req,
      docId: (originalDoc as { id?: string | number } | null | undefined)?.id,
    })

    return typedData
  }
}
```

### Dlaczego `beforeValidate`?

- działa przed walidacją `required + unique`,
- więc unikasz błędów przy identycznych tytułach,
- i możesz ustawić wartość tylko gdy pole jest puste.

---

## 4) Wpięcie hooka do kolekcji

Przykład: `posts`

```ts
import type { CollectionConfig } from 'payload'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeValidate: [
      generateAutoSlug({
        slugField: 'slug',
        sourceFields: ['title', 'name'],
        fallbackPrefix: 'post',
      }),
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
```

Przykład uploadów: `media` z `imageSlug`

```ts
import type { CollectionConfig } from 'payload'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

export const Media: CollectionConfig = {
  slug: 'media',
  hooks: {
    beforeValidate: [
      generateAutoSlug({
        slugField: 'imageSlug',
        sourceFields: [
          'title',
          'alt',
          ({ data }) => {
            const raw = typeof data.originalFilename === 'string' ? data.originalFilename : ''
            return raw.replace(/\.[^.]+$/, '')
          },
        ],
        fallbackPrefix: 'image',
      }),
    ],
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'title', type: 'text' },
    {
      name: 'imageSlug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
  ],
}
```

---

## 5) Admin UI: prefill, ale edytowalne

Najbezpieczniej:

- **backend hook** jest źródłem prawdy,
- UI tylko pomaga użytkownikowi (live sugestia),
- pole `slug` pozostaje zwykłym inputem tekstowym.

Przykładowy custom field component (opcjonalny):

Plik: `apps/web/src/payload/admin/components/SlugField.tsx`

```tsx
'use client'

import { TextInput, useField, useWatchForm } from '@payloadcms/ui'
import { slugifySafe } from '@/payload/lib/slug'

type Props = {
  path: string
  sourcePath?: string
  label?: string
}

export const SlugField: React.FC<Props> = ({ path, sourcePath = 'title', label = 'Slug' }) => {
  const { value, setValue } = useField<string>({ path })
  const source = useWatchForm(([fields]) => fields?.[sourcePath]?.value as string | undefined)

  const isEmpty = !value?.trim()
  const suggested = slugifySafe(source ?? '')

  return (
    <div>
      <TextInput
        path={path}
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {isEmpty && suggested ? (
        <button
          type="button"
          onClick={() => setValue(suggested)}
          style={{ marginTop: 8 }}
        >
          Użyj sugestii: <code>{suggested}</code>
        </button>
      ) : null}
    </div>
  )
}
```

Podłączenie komponentu do pola:

```ts
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  admin: {
    components: {
      Field: '@/payload/admin/components/SlugField#SlugField',
    },
  },
}
```

To daje „prefill UX” i pełną możliwość ręcznej edycji.

---

## 6) Next.js dynamic routing (App Router)

Plik: `apps/web/src/app/[slug]/page.tsx`

```ts
import config from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const payload = await getPayload({ config })
  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 2,
  })

  const page = pages.docs[0]
  if (!page) notFound()

  return <main>{page.title}</main>
}
```

---

## 7) Testy / regresje

Minimalny zestaw:

1. **Autogeneracja**: create bez `slug`, z `title="Zażółć gęślą"` → slug `zazolc-gesla`.
2. **Manual override**: create z `slug="moj-reczny"` → zostaje `moj-reczny`.
3. **Unikalność**: dwa dokumenty z tym samym tytułem → `x`, `x-1`.
4. **Upload fallback**: create media bez title, z `originalFilename="My Image 2026.png"` → `my-image-2026`.
5. **Brak źródła**: create bez źródeł → `resource-<timestamp>`.

Przykład pseudo-testu (Jest):

```ts
it('adds incremental suffix when slug exists', async () => {
  await payload.create({ collection: 'posts', data: { title: 'Oferta weselna' } })
  const second = await payload.create({ collection: 'posts', data: { title: 'Oferta weselna' } })

  expect(second.slug).toBe('oferta-weselna-1')
})
```

---

## 8) Najlepsze praktyki (skrót)

- Hook backendowy traktuj jako **single source of truth**.
- W UI podpowiadaj, ale nie wymuszaj readonly.
- Sanityzuj także ręcznie wpisane slugi.
- Utrzymuj jeden współdzielony util slugify dla wszystkich kolekcji.
- Dla uploadów uwzględnij `originalFilename` + usuwanie rozszerzeń.
- Dla kompatybilności SEO trzymaj lowercase + krótkie, stabilne slugi.

