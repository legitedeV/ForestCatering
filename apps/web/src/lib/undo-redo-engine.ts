import type { PageSection } from '@/components/cms/types'

// ═══════════════════════════════════════════════
// TYPY
// ═══════════════════════════════════════════════

export type EditorCommandType =
  | 'moveBlock'
  | 'removeBlock'
  | 'duplicateBlock'
  | 'addBlock'
  | 'updateBlockField'
  | 'reorderBlocks'
  | 'loadVersion'
  | 'batch'

export interface EditorCommand {
  type: EditorCommandType
  timestamp: number
  label: string
  redo: CommandPayload
  undo: CommandPayload
}

export type CommandPayload =
  | { action: 'setSections'; sections: PageSection[]; selectedBlockIndex: number | null }
  | { action: 'updateField'; blockIndex: number; fieldPath: string; value: unknown }
  | { action: 'batch'; commands: CommandPayload[] }

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function deepCopy(sections: PageSection[]): PageSection[] {
  return JSON.parse(JSON.stringify(sections)) as PageSection[]
}

// ═══════════════════════════════════════════════
// FACTORY FUNCTIONS — tworzenie komend
// ═══════════════════════════════════════════════

export function createMoveBlockCommand(
  sections: PageSection[],
  fromIndex: number,
  toIndex: number,
  selectedBlockIndex: number | null,
): EditorCommand {
  const beforeSections = deepCopy(sections)

  const afterSections = [...sections]
  const [moved] = afterSections.splice(fromIndex, 1)
  afterSections.splice(toIndex, 0, moved)

  return {
    type: 'moveBlock',
    timestamp: Date.now(),
    label: `Przesuń blok #${fromIndex + 1} → #${toIndex + 1}`,
    undo: { action: 'setSections', sections: beforeSections, selectedBlockIndex },
    redo: { action: 'setSections', sections: deepCopy(afterSections), selectedBlockIndex: toIndex },
  }
}

export function createRemoveBlockCommand(
  sections: PageSection[],
  index: number,
  selectedBlockIndex: number | null,
): EditorCommand {
  const beforeSections = deepCopy(sections)
  const blockType = sections[index]?.blockType ?? 'unknown'

  const afterSections = sections.filter((_, i) => i !== index)
  const newSelectedBlockIndex = selectedBlockIndex === index
    ? null
    : selectedBlockIndex !== null && selectedBlockIndex > index
      ? selectedBlockIndex - 1
      : selectedBlockIndex

  return {
    type: 'removeBlock',
    timestamp: Date.now(),
    label: `Usuń blok "${blockType}" #${index + 1}`,
    undo: { action: 'setSections', sections: beforeSections, selectedBlockIndex },
    redo: { action: 'setSections', sections: deepCopy(afterSections), selectedBlockIndex: newSelectedBlockIndex },
  }
}

export function createDuplicateBlockCommand(
  sections: PageSection[],
  index: number,
): EditorCommand {
  const beforeSections = deepCopy(sections)
  const blockType = sections[index]?.blockType ?? 'unknown'

  const block = sections[index]
  const duplicate = JSON.parse(JSON.stringify(block)) as PageSection
  duplicate.id = crypto.randomUUID()
  const afterSections = [...sections]
  afterSections.splice(index + 1, 0, duplicate)

  return {
    type: 'duplicateBlock',
    timestamp: Date.now(),
    label: `Duplikuj blok "${blockType}" #${index + 1}`,
    undo: { action: 'setSections', sections: beforeSections, selectedBlockIndex: index },
    redo: { action: 'setSections', sections: deepCopy(afterSections), selectedBlockIndex: index + 1 },
  }
}

export function createAddBlockCommand(
  sections: PageSection[],
  newBlock: PageSection,
  atIndex: number,
): EditorCommand {
  const beforeSections = deepCopy(sections)
  const blockType = newBlock.blockType ?? 'unknown'

  const afterSections = [...sections]
  afterSections.splice(atIndex, 0, newBlock)

  return {
    type: 'addBlock',
    timestamp: Date.now(),
    label: `Dodaj blok "${blockType}"`,
    undo: { action: 'setSections', sections: beforeSections, selectedBlockIndex: null },
    redo: { action: 'setSections', sections: deepCopy(afterSections), selectedBlockIndex: atIndex },
  }
}

export function createUpdateFieldCommand(
  sections: PageSection[],
  blockIndex: number,
  fieldPath: string,
  oldValue: unknown,
  newValue: unknown,
): EditorCommand {
  return {
    type: 'updateBlockField',
    timestamp: Date.now(),
    label: `Edytuj "${fieldPath}" w bloku #${blockIndex + 1}`,
    undo: { action: 'updateField', blockIndex, fieldPath, value: oldValue },
    redo: { action: 'updateField', blockIndex, fieldPath, value: newValue },
  }
}

// ═══════════════════════════════════════════════
// DEBOUNCING — grupowanie szybkich zmian tekstu
// ═══════════════════════════════════════════════

const DEBOUNCE_WINDOW = 800 // ms

export function shouldMergeWithLastCommand(
  lastCommand: EditorCommand | undefined,
  newType: EditorCommandType,
  blockIndex: number,
  fieldPath: string,
): boolean {
  if (!lastCommand) return false
  if (lastCommand.type !== 'updateBlockField' || newType !== 'updateBlockField') return false
  if (Date.now() - lastCommand.timestamp > DEBOUNCE_WINDOW) return false

  const lastRedo = lastCommand.redo
  if (lastRedo.action !== 'updateField') return false

  return lastRedo.blockIndex === blockIndex && lastRedo.fieldPath === fieldPath
}

// ═══════════════════════════════════════════════
// STACK MANAGEMENT
// ═══════════════════════════════════════════════

const MAX_STACK_SIZE = 100

export function pushCommand(
  undoStack: EditorCommand[],
  command: EditorCommand,
): { undoStack: EditorCommand[]; redoStack: EditorCommand[] } {
  const newStack = [...undoStack, command]
  if (newStack.length > MAX_STACK_SIZE) {
    newStack.shift()
  }
  return { undoStack: newStack, redoStack: [] }
}

export function mergeLastCommand(
  undoStack: EditorCommand[],
  newRedoValue: unknown,
): EditorCommand[] {
  if (undoStack.length === 0) return undoStack
  const newStack = [...undoStack]
  const last = { ...newStack[newStack.length - 1] }
  if (last.redo.action === 'updateField') {
    last.redo = { ...last.redo, value: newRedoValue }
  }
  last.timestamp = Date.now()
  newStack[newStack.length - 1] = last
  return newStack
}
