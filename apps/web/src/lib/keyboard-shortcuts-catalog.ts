export interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  category: 'navigation' | 'editing' | 'view' | 'history'
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // History
  { id: 'undo', keys: ['Ctrl', 'Z'], description: 'Cofnij ostatnią zmianę', category: 'history' },
  { id: 'redo', keys: ['Ctrl', 'Shift', 'Z'], description: 'Ponów cofniętą zmianę', category: 'history' },
  { id: 'redo-alt', keys: ['Ctrl', 'Y'], description: 'Ponów (alternatywne)', category: 'history' },
  { id: 'save', keys: ['Ctrl', 'S'], description: 'Zapisz stronę', category: 'editing' },
  // Editing
  { id: 'delete', keys: ['Delete'], description: 'Usuń zaznaczony blok', category: 'editing' },
  { id: 'duplicate', keys: ['Ctrl', 'D'], description: 'Zduplikuj zaznaczony blok', category: 'editing' },
  // View
  { id: 'grid', keys: ['Ctrl', 'G'], description: 'Przełącz siatkę', category: 'view' },
  { id: 'shortcuts', keys: ['?'], description: 'Pokaż skróty klawiszowe', category: 'view' },
  // Navigation
  { id: 'escape', keys: ['Escape'], description: 'Odznacz blok / zamknij panel', category: 'navigation' },
]

export const SHORTCUT_CATEGORY_LABELS: Record<string, string> = {
  navigation: '🧭 Nawigacja',
  editing: '✏️ Edycja',
  view: '👁 Widok',
  history: '📜 Historia',
}
