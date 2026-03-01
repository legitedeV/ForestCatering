import type { Field } from 'payload'

/**
 * Shared visual editor fields — added to the end of fields[] for every block.
 * animation/animationDuration/etc. are hidden from Payload Admin UI (condition: () => false)
 * but are persisted by Payload CMS. They are only edited from the Visual Editor.
 * styleOverrides replaces the standalone { name: 'styleOverrides', type: 'json', admin: { hidden: true } }
 * that was previously added manually to each block.
 */
export function visualEditorFields(): Field[] {
  return [
    {
      name: 'animation',
      type: 'text',
      label: 'Animacja (visual editor)',
      admin: { condition: () => false },
    },
    {
      name: 'animationDuration',
      type: 'number',
      label: 'Czas animacji (ms)',
      admin: { condition: () => false },
    },
    {
      name: 'animationDelay',
      type: 'number',
      label: 'Opóźnienie animacji (ms)',
      admin: { condition: () => false },
    },
    {
      name: 'animationEasing',
      type: 'text',
      label: 'Easing animacji',
      admin: { condition: () => false },
    },
    {
      name: 'animationIterations',
      type: 'text',
      label: 'Iteracje animacji',
      admin: { condition: () => false },
    },
    {
      name: 'styleOverrides',
      type: 'json',
      label: 'Style Overrides (visual editor)',
      admin: { condition: () => false },
    },
  ]
}
