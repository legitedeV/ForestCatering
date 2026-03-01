'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

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
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#7E8896',
        color: '#12161B',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#9BA3AE'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#7E8896'
      }}
    >
      🎨 Otwórz edytor wizualny
    </button>
  )
}

export default OpenVisualEditorButton
