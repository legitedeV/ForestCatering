'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { ColorPickerField } from './ColorPickerField'

interface Props {
  blockIndex: number
}

export function ColorsPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const styleOverrides = (block.styleOverrides ?? {}) as Record<string, unknown>

  const set = useCallback(
    (key: string, value: unknown) => {
      updateBlockField(blockIndex, `styleOverrides.${key}`, value)
    },
    [blockIndex, updateBlockField],
  )

  return (
    <div className="space-y-3">
      <ColorPickerField
        label="Tekst"
        value={styleOverrides.textColor as string | undefined}
        onChange={(c) => set('textColor', c)}
      />
      <ColorPickerField
        label="Tło"
        value={styleOverrides.backgroundColor as string | undefined}
        onChange={(c) => set('backgroundColor', c)}
      />
      <ColorPickerField
        label="Obramowanie"
        value={styleOverrides.borderColor as string | undefined}
        onChange={(c) => set('borderColor', c)}
      />
      <ColorPickerField
        label="Akcent"
        value={styleOverrides.accentColor as string | undefined}
        onChange={(c) => set('accentColor', c)}
      />
    </div>
  )
}
