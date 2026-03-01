'use client'

import { usePageEditor } from '@/lib/page-editor-store'

interface BlockCommentIndicatorProps {
  blockId: string
  onOpen: () => void
}

export function BlockCommentIndicator({ blockId, onOpen }: BlockCommentIndicatorProps) {
  const blockComments = usePageEditor((s) => s.blockComments)
  const showComments = usePageEditor((s) => s.showComments)

  const commentsForBlock = blockComments.filter((c) => c.blockId === blockId && !c.resolved)

  if (!showComments || commentsForBlock.length === 0) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-warm text-[10px] font-bold text-forest-950"
      aria-label={`${commentsForBlock.length} komentarzy`}
    >
      {commentsForBlock.length}
    </button>
  )
}
