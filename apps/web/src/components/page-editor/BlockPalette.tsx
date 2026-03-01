'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePageEditor } from '@/lib/page-editor-store'
import { BLOCK_CATALOG, BLOCK_CATEGORIES } from '@/lib/block-metadata'

interface BlockPaletteProps {
  insertAtIndex?: number
}

export function BlockPalette({ insertAtIndex }: BlockPaletteProps) {
  const sections = usePageEditor((s) => s.sections)
  const addBlock = usePageEditor((s) => s.addBlock)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)
  const selectBlock = usePageEditor((s) => s.selectBlock)

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const targetIndex = insertAtIndex ?? sections.length

  // Filtrowanie bloków
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return BLOCK_CATALOG.filter((b) => {
      const matchesCategory = activeCategory === 'all' || b.category === activeCategory
      const matchesSearch =
        !q || b.label.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const handleAdd = (blockType: string) => {
    addBlock(blockType, targetIndex)
    setSidebarTab('settings')
    selectBlock(targetIndex)
  }

  return (
    <div className="space-y-3 p-3">
      {/* Wyszukiwanie */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Szukaj bloku..."
        className="w-full rounded-lg border border-forest-700 bg-forest-800 px-3 py-2 text-sm text-cream placeholder:text-forest-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label="Szukaj bloku"
      />

      {/* Chipsy kategorii */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            activeCategory === 'all'
              ? 'bg-accent text-forest-950'
              : 'bg-forest-800 text-forest-300 hover:text-cream'
          }`}
        >
          Wszystkie
        </button>
        {BLOCK_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              activeCategory === cat.key
                ? 'bg-accent text-forest-950'
                : 'bg-forest-800 text-forest-300 hover:text-cream'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid bloków */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((block) => (
          <motion.button
            key={block.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(block.type)}
            className="flex flex-col items-start rounded-lg border border-forest-700 bg-forest-900 p-3 text-left transition hover:border-accent hover:bg-forest-800"
            aria-label={`Dodaj blok ${block.label}`}
          >
            <span className="text-2xl">{block.icon}</span>
            <span className="mt-1 text-xs font-semibold text-cream">{block.label}</span>
            <span className="line-clamp-1 text-xs text-forest-400">{block.description}</span>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-4 text-center text-xs text-forest-500">Brak pasujących bloków</p>
      )}
    </div>
  )
}
