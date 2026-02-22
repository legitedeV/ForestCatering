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

function isLexicalRichText(value: unknown): value is LexicalRichText {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'root' in value &&
      typeof (value as LexicalRichText).root === 'object' &&
      (value as LexicalRichText).root?.type,
  )
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

  return <p className={className ?? 'text-forest-200'}>{emptyMessage}</p>
}
