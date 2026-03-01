'use client'

import { usePageEditor } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import { BlockPalette } from './BlockPalette'
import { BlockFieldEditor } from './BlockFieldEditor'

const TABS = [
  { key: 'blocks' as const, label: 'Sekcje' },
  { key: 'settings' as const, label: 'Edycja' },
  { key: 'add' as const, label: 'Dodaj' },
]

export function EditorSidebar() {
  const sidebarTab = usePageEditor((s) => s.sidebarTab)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)
  const sections = usePageEditor((s) => s.sections)
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const selectBlock = usePageEditor((s) => s.selectBlock)

  return (
    <aside
      className="flex h-[calc(100vh-3.5rem)] w-80 shrink-0 flex-col border-l border-forest-800 bg-forest-900"
      aria-label="Panel boczny edytora"
    >
      {/* Zakładki */}
      <div className="flex border-b border-forest-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSidebarTab(tab.key)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition ${
              sidebarTab === tab.key
                ? 'bg-forest-800 text-cream'
                : 'text-forest-400 hover:text-cream'
            }`}
            aria-selected={sidebarTab === tab.key}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Zawartość zakładki */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab: Sekcje */}
        {sidebarTab === 'blocks' && (
          <div className="space-y-0.5 p-2">
            {sections.length === 0 && (
              <p className="py-8 text-center text-xs text-forest-500">Brak sekcji</p>
            )}
            {sections.map((block, index) => {
              const meta = getBlockMeta(block.blockType)
              const isSelected = selectedBlockIndex === index
              return (
                <button
                  key={block.id ?? `sidebar-${index}`}
                  onClick={() => {
                    selectBlock(index)
                    setSidebarTab('settings')
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                    isSelected
                      ? 'border-l-2 border-accent bg-forest-800 text-cream'
                      : 'border-l-2 border-transparent text-forest-300 hover:bg-forest-800/50 hover:text-cream'
                  }`}
                  aria-label={`Sekcja #${index + 1}: ${meta?.label ?? block.blockType}`}
                >
                  <span>{meta?.icon ?? '📦'}</span>
                  <span className="flex-1 truncate">{meta?.label ?? block.blockType}</span>
                  <span className="text-forest-500">#{index + 1}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Tab: Edycja */}
        {sidebarTab === 'settings' && <BlockFieldEditor />}

        {/* Tab: Dodaj */}
        {sidebarTab === 'add' && <BlockPalette />}
      </div>
    </aside>
  )
}
