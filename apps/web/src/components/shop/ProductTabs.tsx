'use client'

import { useState } from 'react'

interface ProductTabsProps {
  description?: string | null
  allergens?: Array<{ key: string; label: string }> | null
  dietary?: Array<{ key: string; label: string; color: string }> | null
  weight?: string | null
  servings?: number | null
}

type TabKey = 'description' | 'allergens' | 'portions'

export function ProductTabs({ description, allergens, dietary, weight, servings }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Opis' },
    { key: 'allergens', label: 'Alergeny i dieta' },
    { key: 'portions', label: 'Porcje' },
  ]

  return (
    <div>
      <div className="flex gap-6 border-b border-forest-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition ${activeTab === tab.key ? 'border-b-2 border-accent-warm text-cream' : 'text-forest-400 hover:text-forest-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'description' && (
          <div className="text-forest-200">
            {description ? <p>{description}</p> : <p className="text-forest-400">Brak opisu.</p>}
          </div>
        )}

        {activeTab === 'allergens' && (
          <div>
            {allergens && allergens.length > 0 ? (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cream">Alergeny</h4>
                <div className="flex flex-wrap gap-2">
                  {allergens.map((a) => (
                    <span key={a.key} className="rounded-full border border-forest-600 bg-forest-700 px-3 py-1 text-sm text-forest-200">
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-forest-400">Brak informacji o alergenach.</p>
            )}
            {dietary && dietary.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cream">Dieta</h4>
                <div className="flex flex-wrap gap-2">
                  {dietary.map((d) => (
                    <span key={d.key} className={`rounded-full px-3 py-1 text-sm font-medium ${d.color}`}>
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portions' && (
          <div className="text-forest-200">
            {weight || servings ? (
              <div className="flex gap-6 text-sm">
                {weight && <span>📦 Waga: {weight}</span>}
                {servings && <span>👥 Porcje: {servings}</span>}
              </div>
            ) : (
              <p className="text-forest-400">Brak informacji o porcjach.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
