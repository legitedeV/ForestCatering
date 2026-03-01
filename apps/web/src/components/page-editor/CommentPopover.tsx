'use client'

import { useState, useEffect, useRef } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'

interface CommentPopoverProps {
  blockId: string
  blockIndex: number
  blockLabel: string
  onClose: () => void
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'teraz'
    if (mins < 60) return `${mins} min temu`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h temu`
    const days = Math.floor(hrs / 24)
    return `${days}d temu`
  } catch {
    return ''
  }
}

export function CommentPopover({ blockId, blockIndex, blockLabel, onClose }: CommentPopoverProps) {
  const blockComments = usePageEditor((s) => s.blockComments)
  const addComment = usePageEditor((s) => s.addComment)
  const resolveComment = usePageEditor((s) => s.resolveComment)
  const deleteComment = usePageEditor((s) => s.deleteComment)

  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const comments = blockComments.filter((c) => c.blockId === blockId)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addComment(blockId, blockIndex, trimmed)
    setText('')
  }

  return (
    <div
      className="absolute left-full top-0 z-50 ml-2 w-72 rounded-lg border border-forest-700 bg-forest-900 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest-700 px-3 py-2">
        <span className="text-xs font-medium text-cream">
          💬 Komentarze — {blockLabel}
        </span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-forest-400 hover:text-cream"
          aria-label="Zamknij komentarze"
        >
          ✕
        </button>
      </div>

      {/* Comments list */}
      <div className="max-h-60 overflow-y-auto p-2">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-xs text-forest-500">Brak komentarzy</p>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`rounded-md border px-2.5 py-2 text-xs ${
                  c.resolved
                    ? 'border-forest-700/50 bg-forest-800/30 opacity-60'
                    : 'border-forest-700 bg-forest-800/60'
                }`}
              >
                <div className="flex items-center gap-1 text-forest-500">
                  <span>{c.author}</span>
                  <span>·</span>
                  <span>{timeAgo(c.createdAt)}</span>
                  {c.resolved && <span className="ml-auto text-forest-600">✅ Rozwiązany</span>}
                </div>
                <p className="mt-1 text-cream/90">{c.text}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  {!c.resolved && (
                    <button
                      onClick={() => resolveComment(c.id)}
                      className="text-forest-400 transition hover:text-accent-warm"
                      title="Rozwiąż"
                    >
                      ✅ Rozwiąż
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-forest-400 transition hover:text-red-400"
                    title="Usuń"
                  >
                    🗑️ Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add comment form */}
      <div className="border-t border-forest-700 p-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Nowy komentarz..."
          className="w-full resize-none rounded-md border border-forest-700 bg-forest-800 px-2 py-1.5 text-xs text-cream placeholder:text-forest-500 focus:border-accent-warm focus:outline-none"
          rows={2}
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="mt-1.5 rounded-md bg-accent-warm px-3 py-1 text-xs font-medium text-forest-950 transition hover:bg-accent-warm-light disabled:opacity-40"
        >
          💬 Dodaj
        </button>
      </div>
    </div>
  )
}
