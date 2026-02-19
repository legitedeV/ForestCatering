import type { CollectionBeforeValidateHook } from 'payload'

export const populateSlug: CollectionBeforeValidateHook = async ({
  data,
  operation,
}) => {
  if (data && !data.slug && operation === 'create') {
    const source = data.name || data.title || ''
    data.slug = source
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  return data
}
