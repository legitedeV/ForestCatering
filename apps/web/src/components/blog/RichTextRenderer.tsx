import { RichText } from '@payloadcms/richtext-lexical/react'

interface LexicalRichText {
  root: {
    type: string
    children: unknown[]
  }
  [key: string]: unknown
}

interface Props {
  content?: unknown
  className?: string
  emptyMessage?: string
}

const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'img'])

function sanitizeHtmlContent(html: string): string {
  let sanitized = html
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/on[a-z]+\s*=\s*(["']).*?\1/gi, '')
    .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')

  sanitized = sanitized.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, tagName, attrs) => {
    const tag = String(tagName).toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) {
      return ''
    }

    if (full.startsWith('</')) {
      return `</${tag}>`
    }

    if (tag === 'a') {
      const hrefMatch = String(attrs).match(/href\s*=\s*(["'])(.*?)\1/i)
      const href = hrefMatch?.[2] ?? '#'
      const safeHref = /^(https?:|mailto:)/i.test(href) ? href : '#'
      return `<a href="${safeHref}" rel="noopener noreferrer nofollow">`
    }

    if (tag === 'img') {
      const srcMatch = String(attrs).match(/src\s*=\s*(["'])(.*?)\1/i)
      const altMatch = String(attrs).match(/alt\s*=\s*(["'])(.*?)\1/i)
      const src = srcMatch?.[2] ?? ''
      const alt = altMatch?.[2] ?? ''
      const safeSrc = /^https?:/i.test(src) ? src : ''
      return safeSrc ? `<img src="${safeSrc}" alt="${alt}" />` : ''
    }

    return `<${tag}>`
  })

  return sanitized
}

function isLexicalRichText(value: unknown): value is LexicalRichText {
  return Boolean(value && typeof value === 'object' && 'root' in value && typeof (value as LexicalRichText).root === 'object' && (value as LexicalRichText).root?.type)
}

export function RichTextRenderer({
  content,
  className,
  emptyMessage = 'Pełna treść tego artykułu jest dostępna po dodaniu treści w panelu administracyjnym.',
}: Props) {
  if (!content) {
    return <p className={className ?? 'text-forest-200'}>{emptyMessage}</p>
  }

  if (isLexicalRichText(content)) {
    return <RichText data={content as never} className={className} />
  }

  if (typeof content === 'string') {
    const sanitizedHtml = sanitizeHtmlContent(content)

    if (!sanitizedHtml.trim()) {
      return <p className={className ?? 'text-forest-200'}>{emptyMessage}</p>
    }

    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  }

  return <p className={className ?? 'text-forest-200'}>{emptyMessage}</p>
}
