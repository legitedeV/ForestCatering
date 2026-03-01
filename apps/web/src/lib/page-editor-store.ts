'use client'

import { create } from 'zustand'
import type { PageSection } from '@/components/cms/types'
import type { EditorCommand } from './undo-redo-engine'
import {
  createMoveBlockCommand,
  createRemoveBlockCommand,
  createDuplicateBlockCommand,
  createAddBlockCommand,
  createUpdateFieldCommand,
  shouldMergeWithLastCommand,
  pushCommand,
  mergeLastCommand,
} from './undo-redo-engine'
import type { BlockComment } from './block-comments'
import { loadComments, saveComments } from './block-comments'
import type { A11yIssue } from './a11y-checks'

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
  mapArea: { blockType: 'mapArea', heading: 'Obszar dostawy', embedUrl: '', cities: [] },
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

// Odczyt zagnieżdżonego pola po ścieżce (inverse setNestedField)
function getNestedField(obj: Record<string, unknown>, fieldPath: string): unknown {
  const keys = fieldPath.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      current = current[Number(key)]
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return current
}

// ── Block style overrides per-block ──────────────────────
export interface BlockStyleOverrides {
  // Spacing (legacy)
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  width?: string
  maxWidth?: string
  minHeight?: string
  position?: 'static' | 'relative'
  offsetX?: number
  offsetY?: number
  alignSelf?: string

  // Typography
  fontSize?: number
  fontWeight?: 300 | 400 | 500 | 600 | 700 | 800 | 900
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'

  // Colors
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  accentColor?: string

  // Background advanced
  backgroundType?: 'solid' | 'gradient' | 'image' | 'none'
  backgroundGradient?: string
  backgroundImage?: string
  backgroundOverlayOpacity?: number
  backgroundBlur?: number

  // Borders
  borderRadius?: number
  borderRadiusTL?: number
  borderRadiusTR?: number
  borderRadiusBL?: number
  borderRadiusBR?: number
  borderWidth?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'

  // Shadows
  boxShadow?: string
  boxShadowPreset?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'warm-glow' | 'inner' | 'glass'

  // Visibility
  hideOnDesktop?: boolean
  hideOnTablet?: boolean
  hideOnMobile?: boolean

  // Opacity & effects
  opacity?: number
  overflow?: 'visible' | 'hidden' | 'auto'

  // Custom CSS
  customCss?: string
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
  sidebarTab: 'blocks' | 'settings' | 'add' | 'style'

  // Grid overlay
  gridColumns: 12 | 16 | 24
  gridVisible: boolean
  gridShowRulers: boolean
  gridSnapEnabled: boolean

  // Spacing inspector
  spacingInspectorEnabled: boolean

  // Styl / Template
  pageTemplate: string | null
  cssOverrides: Record<string, string>
  customCss: string

  // CSS Overlays (persisted in Payload)
  globalCssOverlay: string
  layoutCssOverlay: string
  selectedCssLayer: 'globals' | 'layout'

  // Undo/Redo
  undoStack: EditorCommand[]
  redoStack: EditorCommand[]
  canUndo: boolean
  canRedo: boolean
  historyPanelOpen: boolean

  // Version History
  versionHistoryOpen: boolean

  // Comments
  blockComments: BlockComment[]
  showComments: boolean

  // Concurrency
  lastKnownUpdatedAt: string | null
  conflictDetected: boolean
  serverUpdatedAt: string | null

  // Shortcuts Panel
  shortcutsOpen: boolean

  // Inline Edit
  inlineEditEnabled: boolean

  // Batch Selection
  selectedBlockIndices: number[]

  // Split Preview
  splitPreviewEnabled: boolean
  splitPreviewBreakpoints: ('desktop' | 'tablet' | 'mobile')[]

  // A11y Audit
  a11yPanelOpen: boolean
  a11yIssues: A11yIssue[]

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

  // Akcje — Undo/Redo
  undo: () => void
  redo: () => void
  undoToIndex: (targetIndex: number) => void
  redoToIndex: (targetIndex: number) => void
  clearHistory: () => void
  toggleHistoryPanel: () => void

  // Akcje — Version History
  toggleVersionHistory: () => void
  restoreVersion: (versionId: string) => Promise<void>
  loadVersionSections: (sections: PageSection[]) => void

  // Akcje — Comments
  addComment: (blockId: string, blockIndex: number, text: string, position?: { xPercent: number; yPercent: number }) => void
  resolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  toggleComments: () => void

  // Akcje — Concurrency
  resolveConflict: (strategy: 'overwrite' | 'reload') => Promise<void>
  dismissConflict: () => void

  // Akcje — UI
  setPreviewBreakpoint: (bp: 'desktop' | 'tablet' | 'mobile') => void
  setSidebarTab: (tab: 'blocks' | 'settings' | 'add' | 'style') => void
  resetEditor: () => void

  // Akcje — Grid
  setGridColumns: (cols: 12 | 16 | 24) => void
  toggleGrid: () => void
  toggleRulers: () => void
  toggleSnap: () => void

  // Akcje — Spacing inspector
  toggleSpacingInspector: () => void

  // Akcje — Styl
  setPageTemplate: (template: string | null) => void
  setCssOverride: (variable: string, value: string) => void
  resetCssOverrides: () => void
  setCustomCss: (css: string) => void

  // Akcje — CSS Overlays
  setGlobalCssOverlay: (css: string) => void
  setLayoutCssOverlay: (css: string) => void
  setSelectedCssLayer: (layer: 'globals' | 'layout') => void

  // Akcje — Shortcuts
  toggleShortcuts: () => void

  // Akcje — Inline Edit
  toggleInlineEdit: () => void

  // Akcje — Batch selection
  toggleBlockSelection: (index: number) => void
  clearBlockSelection: () => void
  batchDeleteBlocks: () => void
  batchDuplicateBlocks: () => void

  // Akcje — Split Preview
  toggleSplitPreview: () => void
  setSplitPreviewBreakpoints: (bps: ('desktop' | 'tablet' | 'mobile')[]) => void

  // Akcje — A11y Audit
  toggleA11yPanel: () => void
  setA11yIssues: (issues: A11yIssue[]) => void
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
  gridColumns: 12 as const,
  gridVisible: false,
  gridShowRulers: false,
  gridSnapEnabled: false,
  spacingInspectorEnabled: false,
  pageTemplate: null as string | null,
  cssOverrides: {} as Record<string, string>,
  customCss: '',
  globalCssOverlay: '',
  layoutCssOverlay: '',
  selectedCssLayer: 'globals' as const,
  undoStack: [] as EditorCommand[],
  redoStack: [] as EditorCommand[],
  canUndo: false,
  canRedo: false,
  historyPanelOpen: false,
  versionHistoryOpen: false,
  blockComments: [] as BlockComment[],
  showComments: false,
  lastKnownUpdatedAt: null as string | null,
  conflictDetected: false,
  serverUpdatedAt: null as string | null,
  shortcutsOpen: false,
  inlineEditEnabled: false,
  selectedBlockIndices: [] as number[],
  splitPreviewEnabled: false,
  splitPreviewBreakpoints: ['desktop', 'tablet', 'mobile'] as ('desktop' | 'tablet' | 'mobile')[],
  a11yPanelOpen: false,
  a11yIssues: [] as A11yIssue[],
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
        updatedAt?: string
        pageTemplate?: string
        globalCssOverlay?: string
        layoutCssOverlay?: string
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
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,
        lastKnownUpdatedAt: data.updatedAt ?? null,
        conflictDetected: false,
        serverUpdatedAt: null,
        blockComments: loadComments(data.id),
        pageTemplate: data.pageTemplate ?? null,
        globalCssOverlay: data.globalCssOverlay ?? '',
        layoutCssOverlay: data.layoutCssOverlay ?? '',
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
    const { pageId, sections, lastKnownUpdatedAt } = get()
    if (!pageId) return

    set({ isSaving: true, error: null })
    try {
      // 1. Check server version for conflicts
      const checkRes = await fetch(`/api/page-editor/${pageId}`, {
        headers: { 'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '' },
      })
      if (checkRes.ok) {
        const serverData = await checkRes.json() as { updatedAt?: string }
        if (lastKnownUpdatedAt && serverData.updatedAt && serverData.updatedAt !== lastKnownUpdatedAt) {
          set({ isSaving: false, conflictDetected: true, serverUpdatedAt: serverData.updatedAt })
          return
        }
      }

      // 2. Save normally
      const res = await fetch(`/api/page-editor/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '',
        },
        body: JSON.stringify({
          sections,
          pageTemplate: get().pageTemplate,
          globalCssOverlay: get().globalCssOverlay,
          layoutCssOverlay: get().layoutCssOverlay,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const result = await res.json() as { updatedAt?: string }
      const sectionsSnapshot = JSON.parse(JSON.stringify(sections)) as PageSection[]
      set({
        isSaving: false,
        isDirty: false,
        originalSections: sectionsSnapshot,
        lastKnownUpdatedAt: result.updatedAt ?? null,
        conflictDetected: false,
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
    const command = createMoveBlockCommand(state.sections, fromIndex, toIndex, state.selectedBlockIndex)
    const { undoStack: newUndo, redoStack: newRedo } = pushCommand(state.undoStack, command)

    const newSections = [...state.sections]
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)

    return {
      sections: newSections,
      isDirty: true,
      selectedBlockIndex: toIndex,
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: false,
    }
  }),

  // Usuń blok
  removeBlock: (index) => set((state) => {
    const command = createRemoveBlockCommand(state.sections, index, state.selectedBlockIndex)
    const { undoStack: newUndo, redoStack: newRedo } = pushCommand(state.undoStack, command)

    const newSections = state.sections.filter((_, i) => i !== index)
    const selectedBlockIndex = state.selectedBlockIndex === index
      ? null
      : state.selectedBlockIndex !== null && state.selectedBlockIndex > index
        ? state.selectedBlockIndex - 1
        : state.selectedBlockIndex
    return {
      sections: newSections,
      isDirty: true,
      selectedBlockIndex,
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: false,
    }
  }),

  // Duplikuj blok
  duplicateBlock: (index) => set((state) => {
    const block = state.sections[index]
    if (!block) return state

    const command = createDuplicateBlockCommand(state.sections, index)
    const { undoStack: newUndo, redoStack: newRedo } = pushCommand(state.undoStack, command)

    const duplicate = JSON.parse(JSON.stringify(block)) as PageSection
    duplicate.id = crypto.randomUUID()
    const newSections = [...state.sections]
    newSections.splice(index + 1, 0, duplicate)
    return {
      sections: newSections,
      isDirty: true,
      selectedBlockIndex: index + 1,
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: false,
    }
  }),

  // Dodaj nowy blok z domyślnymi wartościami
  addBlock: (blockType, atIndex) => set((state) => {
    const defaults = BLOCK_DEFAULTS[blockType]
    if (!defaults) return state
    const newBlock = { ...defaults, id: crypto.randomUUID() } as PageSection

    const command = createAddBlockCommand(state.sections, newBlock, atIndex)
    const { undoStack: newUndo, redoStack: newRedo } = pushCommand(state.undoStack, command)

    const newSections = [...state.sections]
    newSections.splice(atIndex, 0, newBlock)
    return {
      sections: newSections,
      isDirty: true,
      selectedBlockIndex: atIndex,
      sidebarTab: 'blocks',
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: false,
    }
  }),

  // Zaktualizuj pole bloku (immutable deep update)
  updateBlockField: (index, fieldPath, value) => set((state) => {
    const block = state.sections[index]
    if (!block) return state

    const oldValue = getNestedField(block as unknown as Record<string, unknown>, fieldPath)

    const lastCmd = state.undoStack[state.undoStack.length - 1]
    const shouldMerge = shouldMergeWithLastCommand(lastCmd, 'updateBlockField', index, fieldPath)

    let newUndoStack: EditorCommand[]
    let newRedoStack: EditorCommand[]

    if (shouldMerge) {
      newUndoStack = mergeLastCommand(state.undoStack, value)
      newRedoStack = []
    } else {
      const command = createUpdateFieldCommand(state.sections, index, fieldPath, oldValue, value)
      const result = pushCommand(state.undoStack, command)
      newUndoStack = result.undoStack
      newRedoStack = result.redoStack
    }

    const updatedBlock = setNestedField(
      block as unknown as Record<string, unknown>,
      fieldPath,
      value,
    ) as unknown as PageSection
    const newSections = state.sections.map((s, i) => (i === index ? updatedBlock : s))

    return {
      sections: newSections,
      isDirty: true,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      canUndo: newUndoStack.length > 0,
      canRedo: false,
    }
  }),

  // Undo — cofnij ostatnią akcję
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state
    const stack = [...state.undoStack]
    const command = stack.pop()!
    const payload = command.undo

    if (payload.action === 'setSections') {
      return {
        undoStack: stack,
        redoStack: [...state.redoStack, command],
        sections: payload.sections,
        selectedBlockIndex: payload.selectedBlockIndex,
        isDirty: true,
        canUndo: stack.length > 0,
        canRedo: true,
      }
    }

    if (payload.action === 'updateField') {
      const block = state.sections[payload.blockIndex]
      if (!block) {
        return { undoStack: stack, redoStack: [...state.redoStack, command], canUndo: stack.length > 0, canRedo: true }
      }
      const updatedBlock = setNestedField(
        block as unknown as Record<string, unknown>,
        payload.fieldPath,
        payload.value,
      ) as unknown as PageSection
      const newSections = state.sections.map((s, i) => (i === payload.blockIndex ? updatedBlock : s))
      return {
        undoStack: stack,
        redoStack: [...state.redoStack, command],
        sections: newSections,
        isDirty: true,
        canUndo: stack.length > 0,
        canRedo: true,
      }
    }

    return state
  }),

  // Redo — ponów cofniętą akcję
  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state
    const stack = [...state.redoStack]
    const command = stack.pop()!
    const payload = command.redo

    if (payload.action === 'setSections') {
      return {
        redoStack: stack,
        undoStack: [...state.undoStack, command],
        sections: payload.sections,
        selectedBlockIndex: payload.selectedBlockIndex,
        isDirty: true,
        canUndo: true,
        canRedo: stack.length > 0,
      }
    }

    if (payload.action === 'updateField') {
      const block = state.sections[payload.blockIndex]
      if (!block) {
        return { redoStack: stack, undoStack: [...state.undoStack, command], canUndo: true, canRedo: stack.length > 0 }
      }
      const updatedBlock = setNestedField(
        block as unknown as Record<string, unknown>,
        payload.fieldPath,
        payload.value,
      ) as unknown as PageSection
      const newSections = state.sections.map((s, i) => (i === payload.blockIndex ? updatedBlock : s))
      return {
        redoStack: stack,
        undoStack: [...state.undoStack, command],
        sections: newSections,
        isDirty: true,
        canUndo: true,
        canRedo: stack.length > 0,
      }
    }

    return state
  }),

  // Batch undo do punktu w historii
  undoToIndex: (targetIndex: number) => {
    const state = get()
    const stepsToUndo = state.undoStack.length - targetIndex
    for (let i = 0; i < stepsToUndo; i++) {
      get().undo()
    }
  },

  // Batch redo do punktu w historii
  redoToIndex: (targetIndex: number) => {
    const state = get()
    for (let i = 0; i < targetIndex; i++) {
      get().redo()
    }
  },

  // Wyczyść historię undo/redo
  clearHistory: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),

  // Toggle panelu historii
  toggleHistoryPanel: () => set((s) => ({ historyPanelOpen: !s.historyPanelOpen })),

  // Version History
  toggleVersionHistory: () => set((s) => ({ versionHistoryOpen: !s.versionHistoryOpen })),

  restoreVersion: async (versionId: string) => {
    const { pageId } = get()
    if (!pageId) return
    try {
      await fetch(`/api/page-editor/${pageId}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: { 'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '' },
      })
      await get().loadPage(pageId)
      set({ versionHistoryOpen: false })
    } catch {
      // silent
    }
  },

  loadVersionSections: (sections: PageSection[]) => set((state) => {
    const command: EditorCommand = {
      type: 'loadVersion',
      label: 'Wczytaj wersję',
      timestamp: Date.now(),
      undo: { action: 'setSections' as const, sections: state.sections, selectedBlockIndex: state.selectedBlockIndex },
      redo: { action: 'setSections' as const, sections, selectedBlockIndex: null },
    }
    const { undoStack: newUndo, redoStack: newRedo } = pushCommand(state.undoStack, command)
    return {
      sections,
      isDirty: true,
      selectedBlockIndex: null,
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: false,
    }
  }),

  // Comments
  addComment: (blockId, blockIndex, text, position) => {
    const { pageId, blockComments } = get()
    const newComment: BlockComment = {
      id: crypto.randomUUID(),
      blockId,
      blockIndex,
      text,
      author: 'editor',
      createdAt: new Date().toISOString(),
      resolved: false,
      position,
    }
    const updated = [...blockComments, newComment]
    set({ blockComments: updated })
    if (pageId) saveComments(pageId, updated)
  },

  resolveComment: (commentId) => {
    const { pageId, blockComments } = get()
    const updated = blockComments.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
    set({ blockComments: updated })
    if (pageId) saveComments(pageId, updated)
  },

  deleteComment: (commentId) => {
    const { pageId, blockComments } = get()
    const updated = blockComments.filter((c) => c.id !== commentId)
    set({ blockComments: updated })
    if (pageId) saveComments(pageId, updated)
  },

  toggleComments: () => set((s) => ({ showComments: !s.showComments })),

  // Concurrency
  resolveConflict: async (strategy) => {
    const { pageId, sections } = get()
    if (!pageId) return

    if (strategy === 'reload') {
      set({ conflictDetected: false, serverUpdatedAt: null })
      await get().loadPage(pageId)
    } else if (strategy === 'overwrite') {
      set({ conflictDetected: false, serverUpdatedAt: null, isSaving: true, error: null })
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
        const result = await res.json() as { updatedAt?: string }
        const sectionsSnapshot = JSON.parse(JSON.stringify(sections)) as PageSection[]
        set({
          isSaving: false,
          isDirty: false,
          originalSections: sectionsSnapshot,
          lastKnownUpdatedAt: result.updatedAt ?? null,
        })
      } catch (err) {
        set({
          isSaving: false,
          error: err instanceof Error ? err.message : 'Nieznany błąd zapisu',
        })
      }
    }
  },

  dismissConflict: () => set({ conflictDetected: false }),

  // Ustaw breakpoint podglądu
  setPreviewBreakpoint: (bp) => set({ previewBreakpoint: bp }),

  // Ustaw aktywną zakładkę sidebara
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // Resetuj stan edytora
  resetEditor: () => set(initialState),

  // Grid overlay
  setGridColumns: (cols) => set({ gridColumns: cols }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleRulers: () => set((s) => ({ gridShowRulers: !s.gridShowRulers })),
  toggleSnap: () => set((s) => ({ gridSnapEnabled: !s.gridSnapEnabled })),

  // Spacing inspector
  toggleSpacingInspector: () => set((s) => ({ spacingInspectorEnabled: !s.spacingInspectorEnabled })),

  // Ustaw template strony
  setPageTemplate: (template) => set({ pageTemplate: template, isDirty: true }),

  // Ustaw nadpisanie zmiennej CSS
  setCssOverride: (variable, value) => set((state) => ({
    cssOverrides: { ...state.cssOverrides, [variable]: value },
    isDirty: true,
  })),

  // Resetuj nadpisania CSS
  resetCssOverrides: () => set({ cssOverrides: {}, isDirty: true }),

  // Ustaw niestandardowy CSS
  setCustomCss: (css) => set({ customCss: css, isDirty: true }),

  // CSS Overlays
  setGlobalCssOverlay: (css) => set({ globalCssOverlay: css, isDirty: true }),
  setLayoutCssOverlay: (css) => set({ layoutCssOverlay: css, isDirty: true }),
  setSelectedCssLayer: (layer) => set({ selectedCssLayer: layer }),

  // Shortcuts panel
  toggleShortcuts: () => set((s) => ({ shortcutsOpen: !s.shortcutsOpen })),

  // Inline edit
  toggleInlineEdit: () => set((s) => ({ inlineEditEnabled: !s.inlineEditEnabled })),

  // Batch selection
  toggleBlockSelection: (index) => set((s) => ({
    selectedBlockIndices: s.selectedBlockIndices.includes(index)
      ? s.selectedBlockIndices.filter((i) => i !== index)
      : [...s.selectedBlockIndices, index],
  })),

  clearBlockSelection: () => set({ selectedBlockIndices: [] }),

  batchDeleteBlocks: () => set((s) => {
    const sorted = [...s.selectedBlockIndices].sort((a, b) => b - a)
    const newSections = [...s.sections]
    for (const idx of sorted) {
      newSections.splice(idx, 1)
    }
    return {
      sections: newSections,
      selectedBlockIndices: [],
      selectedBlockIndex: null,
      isDirty: true,
    }
  }),

  batchDuplicateBlocks: () => set((s) => {
    const sorted = [...s.selectedBlockIndices].sort((a, b) => a - b)
    const newSections = [...s.sections]
    let offset = 0
    for (const idx of sorted) {
      const block = newSections[idx + offset]
      if (!block) continue
      const copy = { ...JSON.parse(JSON.stringify(block)) as typeof block, id: crypto.randomUUID() }
      newSections.splice(idx + offset + 1, 0, copy)
      offset++
    }
    return {
      sections: newSections,
      selectedBlockIndices: [],
      isDirty: true,
    }
  }),

  // Split Preview
  toggleSplitPreview: () => set((s) => ({ splitPreviewEnabled: !s.splitPreviewEnabled })),
  setSplitPreviewBreakpoints: (bps) => set({ splitPreviewBreakpoints: bps }),

  // A11y Audit
  toggleA11yPanel: () => set((s) => ({ a11yPanelOpen: !s.a11yPanelOpen })),
  setA11yIssues: (issues) => set({ a11yIssues: issues }),
}))
