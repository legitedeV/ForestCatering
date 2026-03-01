'use client'

import { create } from 'zustand'
import type { PageSection } from '@/components/cms/types'

// Domyślne wartości dla nowych bloków
const BLOCK_DEFAULTS: Record<string, Partial<PageSection>> = {
  hero: { blockType: 'hero', heading: 'Nowy nagłówek', subheading: '' },
  richText: {
    blockType: 'richText',
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Nowy tekst...', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
          },
        ],
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
      },
    },
  } as Partial<PageSection>,
  stats: { blockType: 'stats', items: [] },
  services: { blockType: 'services', heading: 'Usługi', items: [] },
  cta: { blockType: 'cta', heading: 'Nowe CTA', text: '', buttonText: 'Kliknij', buttonLink: '/' },
  faq: { blockType: 'faq', items: [] },
  gallery: { blockType: 'gallery', images: [] },
  galleryFull: { blockType: 'galleryFull', heading: 'Galeria', items: [] },
  testimonials: { blockType: 'testimonials', heading: 'Opinie', items: [] },
  featuredProducts: { blockType: 'featuredProducts', heading: 'Polecane', limit: 4 },
  about: { blockType: 'about', heading: 'O nas', badge: '' },
  pricing: { blockType: 'pricing', heading: 'Cennik', packages: [] },
  steps: { blockType: 'steps', heading: 'Kroki', steps: [] },
  contactForm: { blockType: 'contactForm', heading: 'Kontakt' },
  legalText: {
    blockType: 'legalText',
    heading: 'Regulamin',
    content: { root: { type: 'root', children: [], format: '', indent: 0, version: 1, direction: 'ltr' } },
  } as Partial<PageSection>,
  partners: { blockType: 'partners', heading: 'Partnerzy', items: [] },
  team: { blockType: 'team', heading: 'Zespół', people: [] },
  mapArea: { blockType: 'mapArea', heading: 'Obszar dostawy', embedUrl: '' },
  offerCards: { blockType: 'offerCards', heading: 'Oferta', cards: [] },
}

// Immutable update zagnieżdżonego pola (np. "heading" lub "items.0.title")
function setNestedField(obj: Record<string, unknown>, fieldPath: string, value: unknown): Record<string, unknown> {
  const keys = fieldPath.split('.')
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value }
  }

  const [head, ...rest] = keys
  const child = obj[head]

  if (Array.isArray(child)) {
    const index = Number(rest[0])
    const remaining = rest.slice(1)
    const newArray = [...child]
    if (remaining.length === 0) {
      newArray[index] = value
    } else {
      newArray[index] = setNestedField(
        newArray[index] as Record<string, unknown>,
        remaining.join('.'),
        value,
      )
    }
    return { ...obj, [head]: newArray }
  }

  return {
    ...obj,
    [head]: setNestedField(
      (child ?? {}) as Record<string, unknown>,
      rest.join('.'),
      value,
    ),
  }
}

interface EditorState {
  // Dane strony
  pageId: number | null
  pageTitle: string
  pagePath: string
  sections: PageSection[]
  originalSections: PageSection[]  // do porównywania zmian

  // Stan UI
  selectedBlockIndex: number | null
  isDirty: boolean
  isSaving: boolean
  isLoading: boolean
  error: string | null
  previewBreakpoint: 'desktop' | 'tablet' | 'mobile'

  // Stan sidebara
  sidebarTab: 'blocks' | 'settings' | 'add'

  // Akcje — strona
  loadPage: (pageId: number) => Promise<void>
  savePage: () => Promise<void>

  // Akcje — manipulacja blokami
  selectBlock: (index: number | null) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  removeBlock: (index: number) => void
  duplicateBlock: (index: number) => void
  addBlock: (blockType: string, atIndex: number) => void
  updateBlockField: (index: number, fieldPath: string, value: unknown) => void

  // Akcje — UI
  setPreviewBreakpoint: (bp: 'desktop' | 'tablet' | 'mobile') => void
  setSidebarTab: (tab: 'blocks' | 'settings' | 'add') => void
  resetEditor: () => void
}

const initialState = {
  pageId: null,
  pageTitle: '',
  pagePath: '',
  sections: [] as PageSection[],
  originalSections: [] as PageSection[],
  selectedBlockIndex: null,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  error: null,
  previewBreakpoint: 'desktop' as const,
  sidebarTab: 'blocks' as const,
}

export const usePageEditor = create<EditorState>()((set, get) => ({
  ...initialState,

  // Załaduj stronę z API
  loadPage: async (pageId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/page-editor/${pageId}`, {
        headers: { 'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '' },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as {
        id: number
        title: string
        path: string
        sections: PageSection[]
      }
      const sectionsSnapshot = JSON.parse(JSON.stringify(data.sections)) as PageSection[]
      set({
        pageId: data.id,
        pageTitle: data.title,
        pagePath: data.path,
        sections: data.sections,
        originalSections: sectionsSnapshot,
        isLoading: false,
        isDirty: false,
        selectedBlockIndex: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Nieznany błąd ładowania',
      })
    }
  },

  // Zapisz zmiany sekcji na serwerze
  savePage: async () => {
    const { pageId, sections } = get()
    if (!pageId) return

    set({ isSaving: true, error: null })
    try {
      const res = await fetch(`/api/page-editor/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '',
        },
        body: JSON.stringify({ sections }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const sectionsSnapshot = JSON.parse(JSON.stringify(sections)) as PageSection[]
      set({
        isSaving: false,
        isDirty: false,
        originalSections: sectionsSnapshot,
      })
    } catch (err) {
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : 'Nieznany błąd zapisu',
      })
    }
  },

  // Wybierz blok do edycji
  selectBlock: (index) => set({ selectedBlockIndex: index }),

  // Przesuń blok z pozycji fromIndex na toIndex
  moveBlock: (fromIndex, toIndex) => set((state) => {
    const newSections = [...state.sections]
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)
    const isDirty = JSON.stringify(newSections) !== JSON.stringify(state.originalSections)
    return { sections: newSections, isDirty, selectedBlockIndex: toIndex }
  }),

  // Usuń blok
  removeBlock: (index) => set((state) => {
    const newSections = state.sections.filter((_, i) => i !== index)
    const isDirty = JSON.stringify(newSections) !== JSON.stringify(state.originalSections)
    const selectedBlockIndex = state.selectedBlockIndex === index
      ? null
      : state.selectedBlockIndex !== null && state.selectedBlockIndex > index
        ? state.selectedBlockIndex - 1
        : state.selectedBlockIndex
    return { sections: newSections, isDirty, selectedBlockIndex }
  }),

  // Duplikuj blok
  duplicateBlock: (index) => set((state) => {
    const block = state.sections[index]
    if (!block) return state
    const duplicate = { ...JSON.parse(JSON.stringify(block)) as PageSection, id: crypto.randomUUID() }
    const newSections = [...state.sections]
    newSections.splice(index + 1, 0, duplicate)
    const isDirty = JSON.stringify(newSections) !== JSON.stringify(state.originalSections)
    return { sections: newSections, isDirty, selectedBlockIndex: index + 1 }
  }),

  // Dodaj nowy blok z domyślnymi wartościami
  addBlock: (blockType, atIndex) => set((state) => {
    const defaults = BLOCK_DEFAULTS[blockType]
    if (!defaults) return state
    const newBlock = { ...defaults, id: crypto.randomUUID() } as PageSection
    const newSections = [...state.sections]
    newSections.splice(atIndex, 0, newBlock)
    const isDirty = JSON.stringify(newSections) !== JSON.stringify(state.originalSections)
    return { sections: newSections, isDirty, selectedBlockIndex: atIndex, sidebarTab: 'blocks' }
  }),

  // Zaktualizuj pole bloku (immutable deep update)
  updateBlockField: (index, fieldPath, value) => set((state) => {
    const block = state.sections[index]
    if (!block) return state
    const updatedBlock = setNestedField(
      block as unknown as Record<string, unknown>,
      fieldPath,
      value,
    ) as unknown as PageSection
    const newSections = state.sections.map((s, i) => (i === index ? updatedBlock : s))
    const isDirty = JSON.stringify(newSections) !== JSON.stringify(state.originalSections)
    return { sections: newSections, isDirty }
  }),

  // Ustaw breakpoint podglądu
  setPreviewBreakpoint: (bp) => set({ previewBreakpoint: bp }),

  // Ustaw aktywną zakładkę sidebara
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // Resetuj stan edytora
  resetEditor: () => set(initialState),
}))
