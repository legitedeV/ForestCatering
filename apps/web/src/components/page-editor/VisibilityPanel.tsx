'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { FieldToggle } from './field-primitives'

interface Props {
  blockIndex: number
}

export function VisibilityPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const so = (block.styleOverrides ?? {}) as Record<string, unknown>

  const set = useCallback(
    (key: string, value: unknown) => {
      updateBlockField(blockIndex, `styleOverrides.${key}`, value)
    },
    [blockIndex, updateBlockField],
  )

  return (
    <div className="space-y-2">
      <FieldToggle
        label="Ukryj na Desktop"
        checked={!!(so.hideOnDesktop as boolean)}
        onChange={(v) => set('hideOnDesktop', v)}
      />
      <FieldToggle
        label="Ukryj na Tablet"
        checked={!!(so.hideOnTablet as boolean)}
        onChange={(v) => set('hideOnTablet', v)}
      />
      <FieldToggle
        label="Ukryj na Mobile"
        checked={!!(so.hideOnMobile as boolean)}
        onChange={(v) => set('hideOnMobile', v)}
      />
      <p className="text-[10px] text-forest-500">
        ℹ️ Blok ukryty na danym breakpoincie nie renderuje się w podglądzie.
      </p>
    </div>
  )
}
