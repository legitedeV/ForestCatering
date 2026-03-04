'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { usePageEditor } from '@/lib/page-editor-store'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import type { PageSection } from '@/components/cms/types'
import { ResizeHandles } from './ResizeHandles'

interface CanvasBlockProps {
  block: PageSection
  index: number
  total: number
  onDragStart?: (index: number) => void
  onDrag?: (index: number, rect: { x: number; y: number; width: number; height: number }) => void
  onDragEnd?: () => void
}

const CanvasBlockInner = React.memo(function CanvasBlockInner({
  block,
  index,
  total,
  onDragStart,
  onDrag,
  onDragEnd: onDragEndProp,
}: CanvasBlockProps) {
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const selectBlock = usePageEditor((s) => s.selectBlock)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)
  const selectedBlockIndices = usePageEditor((s) => s.selectedBlockIndices)
  const toggleBlockSelection = usePageEditor((s) => s.toggleBlockSelection)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)
  const duplicateBlock = usePageEditor((s) => s.duplicateBlock)
  const removeBlock = usePageEditor((s) => s.removeBlock)
  const canvasZoom = usePageEditor((s) => s.canvasZoom)

  const [isDragging, setIsDragging] = useState(false)

  const meta = getBlockMeta(block.blockType)
  const so = ((block as Record<string, unknown>).styleOverrides ?? {}) as BlockStyleOverrides
  const x = so.offsetX ?? 0
  const y = so.offsetY ?? 0
  const w = parseInt(so.width ?? '800', 10) || 800
  const h = parseInt(so.minHeight ?? '120', 10) || 120
  const blockName = (block as Record<string, unknown>).blockName as string | undefined

  const isSelected = selectedBlockIndex === index
  const isBatchSelected = selectedBlockIndices.includes(index)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey) {
      toggleBlockSelection(index)
      return
    }
    selectBlock(index)
    setSidebarTab('settings')
  }, [index, selectBlock, setSidebarTab, toggleBlockSelection])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onDragStart?.(index)
  }, [index, onDragStart])

  const handleDrag = useCallback((_: unknown, info: PanInfo) => {
    const newX = x + Math.round(info.offset.x / canvasZoom)
    const newY = y + Math.round(info.offset.y / canvasZoom)
    onDrag?.(index, { x: newX, y: newY, width: w, height: h })
  }, [x, y, w, h, index, canvasZoom, onDrag])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const newX = x + Math.round(info.offset.x / canvasZoom)
    const newY = y + Math.round(info.offset.y / canvasZoom)
    updateBlockField(index, 'styleOverrides.offsetX', newX)
    updateBlockField(index, 'styleOverrides.offsetY', newY)
    setIsDragging(false)
    onDragEndProp?.()
  }, [x, y, index, updateBlockField, canvasZoom, onDragEndProp])

  const handleResize = useCallback((newW: number, newH: number) => {
    updateBlockField(index, 'styleOverrides.width', `${newW}px`)
    updateBlockField(index, 'styleOverrides.minHeight', `${newH}px`)
  }, [index, updateBlockField])

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`absolute cursor-move rounded-lg border transition-shadow ${
        isDragging
          ? 'z-50 shadow-2xl border-accent'
          : isSelected
            ? 'border-accent ring-2 ring-accent/30 shadow-lg shadow-accent/10'
            : isBatchSelected
              ? 'border-accent-warm ring-1 ring-accent-warm/30'
              : 'border-forest-700 hover:border-forest-600'
      }`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        willChange: 'transform',
        zIndex: isDragging ? 50 : isSelected ? 10 : 1,
        pointerEvents: 'auto',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-forest-700 bg-forest-900/90 px-3 py-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-sm">{meta?.icon ?? '📦'}</span>
          <span className="truncate text-xs font-medium text-cream">{meta?.label ?? block.blockType}</span>
          {blockName && (
            <span className="truncate text-[10px] text-forest-400">— {blockName}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded bg-forest-800 px-1 py-0.5 text-[9px] tabular-nums text-forest-500">
            x:{x} y:{y}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); duplicateBlock(index) }}
            className="rounded p-0.5 text-forest-400 hover:bg-forest-700 hover:text-cream"
            aria-label="Duplikuj"
            title="Duplikuj"
          >
            📋
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('Usunąć sekcję?')) removeBlock(index)
            }}
            className="rounded p-0.5 text-forest-400 hover:bg-red-900/50 hover:text-red-400"
            aria-label="Usuń"
            title="Usuń"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 items-center justify-center rounded-b-lg bg-forest-950/80 p-4">
        <div className="text-center">
          <span className="text-2xl">{meta?.icon ?? '📦'}</span>
          <p className="mt-1 text-xs text-forest-500">
            {meta?.label ?? block.blockType} #{index + 1}
          </p>
          <p className="mt-0.5 text-[10px] text-forest-600">
            {w} × {h}
          </p>
        </div>
      </div>

      {/* Resize handles — only when selected */}
      {isSelected && (
        <ResizeHandles
          width={w}
          minHeight={h}
          onResize={handleResize}
          zoom={canvasZoom}
        />
      )}
    </motion.div>
  )
})

export function CanvasBlock(props: CanvasBlockProps) {
  return <CanvasBlockInner {...props} />
}
