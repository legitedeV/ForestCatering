# Blog Rendering

This document explains how blog post content is stored and rendered in Forest Catering.

## How blog content is stored

Blog posts are stored in the `posts` collection in Payload CMS v3. The `content` field uses the **Lexical richtext editor**, which stores content as a serialized JSON object (`SerializedEditorState` from the `lexical` package).

The JSON structure looks like this:

```json
{
  "root": {
    "type": "root",
    "children": [ ...nodes... ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1
  }
}
```

### Node types

| Node type | Description | Key fields |
|-----------|-------------|------------|
| `paragraph` | A paragraph of text | `children` (text/inline nodes) |
| `heading` | A heading | `tag` (`h1`–`h6`), `children` |
| `text` | Inline text | `text`, `format` (bitmask: 0=normal, 1=bold, 2=italic, 3=bold+italic, 16=code) |
| `list` | List container | `listType` (`bullet`/`number`), `tag` (`ul`/`ol`), `children` |
| `listitem` | A list item | `value`, `children` |
| `quote` | A blockquote | `children` |
| `link` | An inline link | `fields.url`, `fields.newTab`, `fields.linkType`, `children` |

## How it's rendered

The `<RichText>` component from `@payloadcms/richtext-lexical/react` converts the Lexical JSON into React elements. It handles all standard Lexical node types and renders them as semantic HTML.

**File:** `apps/web/src/app/(site)/blog/[slug]/page.tsx`

```tsx
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'

// In the component:
{post.content ? (
  <RichText data={post.content} />
) : (
  <p>No content available.</p>
)}
```

The `<RichText>` component is wrapped in a `.prose` container that applies Tailwind CSS Typography styles for consistent formatting.

## Adding new Lexical node types

If you need to render custom Lexical nodes (e.g., custom blocks added via Payload's Lexical features), you can pass custom converters to `<RichText>`:

```tsx
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

const customConverters: JSXConverters = {
  // Add custom node type converters here
}

<RichText data={post.content} converters={customConverters} />
```

Refer to the [Payload Lexical documentation](https://payloadcms.com/docs/rich-text/lexical) for the full list of built-in features and how to register custom ones.

## Running the seed

The seed script populates the database with sample categories, products, and blog posts. It is idempotent:
- Products are skipped if any already exist.
- Blog posts are skipped individually if a post with the same slug already exists.

```bash
cd apps/web
DATABASE_URI=postgres://... PAYLOAD_SECRET=... npm run seed
```

## Running the tests

### Playwright E2E tests

```bash
cd apps/web
# Start the server first (or use the CI workflow which starts it automatically)
npm run start &
npx wait-on http://localhost:3000
npx playwright test
```

### Blog richtext-specific tests

```bash
cd apps/web
npx playwright test e2e/blog-richtext.spec.ts
```

The `blog-richtext.spec.ts` tests verify:
- The blog listing page shows at least one post link
- The blog post detail page renders proper HTML elements: `h2`, `strong`, `ul`/`ol`, `a[href]`, `blockquote`
- No `<script>` tags exist in the rendered prose content (XSS regression)
- A screenshot is saved to `test-results/blog-post-richtext.png`
