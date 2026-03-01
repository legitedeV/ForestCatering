import type { PageSection } from '@/components/cms/types'

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged' | 'moved'

export interface SectionDiff {
  type: DiffType
  blockType: string
  index: number
  oldIndex?: number
  oldSection?: PageSection
  newSection?: PageSection
  changedFields?: FieldDiff[]
}

export interface FieldDiff {
  fieldPath: string
  oldValue: unknown
  newValue: unknown
  type: 'changed' | 'added' | 'removed'
}

/**
 * Compare two section lists by matching on `id` (UUID).
 * 1. Match sections by id → moved / modified / unchanged
 * 2. Unmatched in newSections → added
 * 3. Unmatched in oldSections → removed
 * 4. Matched → deep compare fields → changedFields
 */
export function diffSections(
  oldSections: PageSection[],
  newSections: PageSection[],
): SectionDiff[] {
  const diffs: SectionDiff[] = []
  const oldById = new Map<string, { section: PageSection; index: number }>()
  for (let i = 0; i < oldSections.length; i++) {
    const id = oldSections[i].id
    if (id) oldById.set(id, { section: oldSections[i], index: i })
  }
  const matchedOldIds = new Set<string>()

  for (let i = 0; i < newSections.length; i++) {
    const newSec = newSections[i]
    const id = newSec.id
    const oldMatch = id ? oldById.get(id) : undefined

    if (!oldMatch) {
      diffs.push({ type: 'added', blockType: newSec.blockType, index: i, newSection: newSec })
    } else {
      if (id) matchedOldIds.add(id)
      const moved = oldMatch.index !== i
      const changed = JSON.stringify(oldMatch.section) !== JSON.stringify(newSec)
      const changedFields = changed ? computeFieldDiffs(oldMatch.section, newSec) : []

      if (moved && changed) {
        diffs.push({ type: 'modified', blockType: newSec.blockType, index: i, oldIndex: oldMatch.index, oldSection: oldMatch.section, newSection: newSec, changedFields })
      } else if (moved) {
        diffs.push({ type: 'moved', blockType: newSec.blockType, index: i, oldIndex: oldMatch.index, oldSection: oldMatch.section, newSection: newSec })
      } else if (changed) {
        diffs.push({ type: 'modified', blockType: newSec.blockType, index: i, oldIndex: oldMatch.index, oldSection: oldMatch.section, newSection: newSec, changedFields })
      } else {
        diffs.push({ type: 'unchanged', blockType: newSec.blockType, index: i, newSection: newSec })
      }
    }
  }

  for (const [id, { section, index }] of oldById) {
    if (!matchedOldIds.has(id)) {
      diffs.push({ type: 'removed', blockType: section.blockType, index, oldSection: section })
    }
  }

  return diffs
}

function computeFieldDiffs(oldSec: PageSection, newSec: PageSection): FieldDiff[] {
  const diffs: FieldDiff[] = []
  const oldObj = oldSec as Record<string, unknown>
  const newObj = newSec as Record<string, unknown>
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  for (const key of allKeys) {
    if (key === 'id') continue
    const oldVal = oldObj[key]
    const newVal = newObj[key]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (oldVal === undefined) diffs.push({ fieldPath: key, oldValue: undefined, newValue: newVal, type: 'added' })
      else if (newVal === undefined) diffs.push({ fieldPath: key, oldValue: oldVal, newValue: undefined, type: 'removed' })
      else diffs.push({ fieldPath: key, oldValue: oldVal, newValue: newVal, type: 'changed' })
    }
  }
  return diffs
}
