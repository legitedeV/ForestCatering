import type { CollectionBeforeValidateHook } from 'payload'
import { slugifySafe, stripFileExtension } from '../lib/slug'

type SourceResolver =
  | string
  | ((ctx: { data: Record<string, unknown>; originalDoc?: Record<string, unknown> | null }) => unknown)

type GenerateAutoSlugArgs = {
  slugField?: string
  sourceFields?: SourceResolver[]
  fallbackPrefix?: string
  maxLength?: number
}

type FindResult = { docs: Array<{ id: string | number }> }

type FindBySlug = (args: {
  collection: string
  where: Record<string, unknown>
  limit: number
  depth: number
  overrideAccess: boolean
  pagination: boolean
}) => Promise<FindResult>

const toStringSafe = (value: unknown): string => (typeof value === 'string' ? value : '')

const resolveSource = (
  resolver: SourceResolver,
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown> | null,
): string => {
  if (typeof resolver === 'function') return toStringSafe(resolver({ data, originalDoc }))

  const fromData = toStringSafe(data[resolver])
  if (fromData) return fromData

  return toStringSafe(originalDoc?.[resolver])
}

const uniqueSlug = async ({
  baseSlug,
  collectionSlug,
  findBySlug,
  docId,
  slugField,
}: {
  baseSlug: string
  collectionSlug: string
  findBySlug: FindBySlug
  docId?: string | number
  slugField: string
}): Promise<string> => {
  let candidate = baseSlug
  let index = 0

  while (true) {
    const result = await findBySlug({
      collection: collectionSlug,
      where: {
        [slugField]: { equals: candidate },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      pagination: false,
    })

    const takenByOtherDoc = result.docs.some((doc) => String(doc.id) !== String(docId ?? ''))
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

    if (currentRaw.trim()) {
      typedData[slugField] = slugifySafe(currentRaw, { maxLength })
      return typedData
    }

    const rawSource =
      sourceFields
        .map((source) => resolveSource(source, typedData, originalDoc as Record<string, unknown> | null))
        .find(Boolean) ?? ''

    const preparedSource =
      rawSource === toStringSafe(typedData.originalFilename) ? stripFileExtension(rawSource) : rawSource

    const base = slugifySafe(preparedSource, { maxLength }) || `${fallbackPrefix}-${Date.now()}`

    typedData[slugField] = await uniqueSlug({
      baseSlug: base,
      collectionSlug: collection.slug,
      findBySlug: req.payload.find as unknown as FindBySlug,
      docId: (originalDoc as { id?: string | number } | null | undefined)?.id,
      slugField,
    })

    return typedData
  }
}
