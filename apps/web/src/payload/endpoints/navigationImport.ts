import { isAdminOrEditor } from '../access/isAdminOrEditor'
import type { Endpoint } from 'payload'
import { z } from 'zod'

const navLinkSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  label: z.string().trim().min(1, 'Pole label jest wymagane.'),
  url: z.string().trim().min(1, 'Pole url jest wymagane.'),
})

const footerColumnSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  links: z.array(navLinkSchema),
  title: z.string().trim().min(1, 'Pole title jest wymagane.'),
})

const navigationSchema = z.object({
  footerColumns: z.array(footerColumnSchema),
  headerItems: z.array(navLinkSchema),
})

const importBodySchema = z.object({
  json: z.string().min(1, 'Wklej JSON do importu.'),
})

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim()

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed === '/FAQ' ? '/faq' : trimmed
  }

  const normalized = `/${trimmed}`
  return normalized === '/FAQ' ? '/faq' : normalized
}

const toValidationErrors = (error: z.ZodError): string[] => {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
    return `${path}: ${issue.message}`
  })
}

export const navigationImportEndpoint: Endpoint = {
  method: 'post',
  path: '/navigation/import',
  handler: async (req) => {
    const canUpdate = Boolean(isAdminOrEditor({ req }))

    if (!canUpdate) {
      return Response.json({ message: 'Brak uprawnień do importu nawigacji.' }, { status: 403 })
    }

    let body: unknown = req.body ?? null

    if (typeof req.json === 'function') {
      body = await req.json().catch(() => null)
    }
    const parsedBody = importBodySchema.safeParse(body)

    if (!parsedBody.success) {
      return Response.json(
        {
          errors: toValidationErrors(parsedBody.error),
          message: 'Niepoprawne dane wejściowe.',
        },
        { status: 400 },
      )
    }

    let parsedJSON: unknown = null

    try {
      parsedJSON = JSON.parse(parsedBody.data.json)
    } catch {
      return Response.json({ message: 'Wklejony tekst nie jest poprawnym JSON-em.' }, { status: 400 })
    }

    const validated = navigationSchema.safeParse(parsedJSON)

    if (!validated.success) {
      return Response.json(
        {
          errors: toValidationErrors(validated.error),
          message: 'JSON ma niepoprawną strukturę.',
        },
        { status: 400 },
      )
    }

    const sanitizedData = {
      headerItems: validated.data.headerItems.map((item) => ({
        label: item.label,
        url: normalizeUrl(item.url),
      })),
      footerColumns: validated.data.footerColumns.map((column) => ({
        title: column.title,
        links: column.links.map((link) => ({
          label: link.label,
          url: normalizeUrl(link.url),
        })),
      })),
    }

    const updatedNavigation = await req.payload.updateGlobal({
      slug: 'navigation',
      data: sanitizedData,
      req,
      depth: 0,
    })

    return Response.json({ navigation: updatedNavigation, message: 'Import zakończony sukcesem.' }, { status: 200 })
  },
}
