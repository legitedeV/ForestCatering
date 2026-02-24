import type { CollectionBeforeValidateHook } from 'payload'

const MAX_PARENT_DEPTH = 10

function normalizeSlugValue(value: unknown): string {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-/]/g, '')
    .replace(/\/+/g, '/')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '')
}

function getRelationshipId(value: unknown): string | number | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return value

  if (typeof value === 'object' && 'id' in value) {
    const relationshipId = (value as { id?: string | number }).id
    if (typeof relationshipId === 'string' || typeof relationshipId === 'number') {
      return relationshipId
    }
  }

  return null
}

export const computePagePath: CollectionBeforeValidateHook = async ({ data, req, originalDoc, operation }) => {
  if (!data) return data

  const normalizedSlug = normalizeSlugValue(data.slug)
  if (!normalizedSlug) {
    throw new Error('Slug jest wymagany i musi zawierać poprawne znaki URL.')
  }

  data.slug = normalizedSlug

  const parentId = getRelationshipId(data.parent)
  const currentId = operation === 'update' ? originalDoc?.id : null

  if (parentId && currentId && String(parentId) === String(currentId)) {
    throw new Error('Strona nie może być swoim własnym parentem.')
  }

  let computedPath = normalizedSlug

  if (parentId) {
    const visited = new Set<string>(currentId ? [String(currentId)] : [])
    let cursor: string | number | null = parentId
    let depth = 0
    let parentPath = ''

    while (cursor) {
      depth += 1
      if (depth > MAX_PARENT_DEPTH) {
        throw new Error(`Maksymalna głębokość drzewa stron to ${MAX_PARENT_DEPTH}.`)
      }

      const key = String(cursor)
      if (visited.has(key)) {
        throw new Error('Wykryto cykl w relacjach parent/child dla stron.')
      }
      visited.add(key)

      const parentDoc = await req.payload.findByID({
        collection: 'pages',
        id: cursor,
        depth: 0,
        draft: true,
      })

      const parentDocPath = (parentDoc as { path?: unknown }).path
      if (typeof parentDocPath !== 'string' || !parentDocPath) {
        throw new Error('Strona nadrzędna musi mieć wyliczone pole path.')
      }

      parentPath = parentDocPath
      cursor = getRelationshipId((parentDoc as { parent?: unknown }).parent)
    }

    computedPath = `${parentPath}/${normalizedSlug}`
  }

  data.path = computedPath

  const existingPath = await req.payload.find({
    collection: 'pages',
    where: {
      and: [
        { path: { equals: computedPath } },
        ...(currentId ? [{ id: { not_equals: currentId } }] : []),
      ],
    },
    depth: 0,
    draft: true,
    limit: 1,
  })

  if (existingPath.docs.length > 0) {
    throw new Error('Taki URL już istnieje.')
  }

  return data
}
