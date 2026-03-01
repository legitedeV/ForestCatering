'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const ACCENT = '#7E8896'
const ACCENT_HOVER = '#9BA3AE'

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: ACCENT,
  color: '#12161B',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  transition: 'background-color 0.2s ease',
}

/** Przycisk otwierający wizualny edytor strony w nowej karcie */
export const OpenVisualEditorButton: React.FC = () => {
  const { id } = useDocumentInfo()

  if (!id) return null

  const handleClick = () => {
    window.open(`/page-editor/${id}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = ACCENT_HOVER
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = ACCENT
      }}
    >
      🎨 Otwórz edytor wizualny
    </button>
  )
}

export default OpenVisualEditorButton
