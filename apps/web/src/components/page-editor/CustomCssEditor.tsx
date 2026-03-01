'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { useLocalField, labelClasses } from './field-primitives'

interface Props {
  blockIndex: number
}

export function CustomCssEditor({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  const so = (block?.styleOverrides ?? {}) as Record<string, unknown>
  const customCss = (so.customCss as string) ?? ''

  const commitCss = useCallback(
    (v: string) => {
      updateBlockField(blockIndex, 'styleOverrides.customCss', v)
    },
    [blockIndex, updateBlockField],
  )

  const [local, setLocal] = useLocalField(customCss, commitCss, 600)

  if (!block) return null

  return (
    <div className="space-y-2">
      <span className={labelClasses}>CSS scoped do tego bloku</span>
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={`.this {\n  /* twoje style */\n}`}
        className="editor-custom-css-textarea w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-cream placeholder:text-forest-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        rows={5}
        aria-label="Custom CSS"
      />
      <p className="text-[10px] text-forest-500">
        ℹ️ Użyj <code className="text-accent-warm">.this</code> jako selektora tego bloku. CSS jest scoped.
      </p>
    </div>
  )
}
