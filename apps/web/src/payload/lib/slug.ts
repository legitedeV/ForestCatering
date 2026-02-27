export type SlugifyOptions = {
  maxLength?: number
}

/**
 * SEO-safe slug:
 * - lowercase
 * - removes diacritics (NFD)
 * - replaces whitespace/underscores with "-"
 * - removes special chars
 * - collapses repeated "-"
 */
export const slugifySafe = (input: string, options: SlugifyOptions = {}): string => {
  const maxLength = options.maxLength ?? 80

  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return ''
  return slug.slice(0, maxLength).replace(/-+$/g, '')
}

export const stripFileExtension = (filename: string): string => filename.replace(/\.[^.]+$/, '')
