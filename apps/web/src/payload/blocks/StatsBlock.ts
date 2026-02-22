import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Statystyki', plural: 'Statystyki' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Statystyki',
      labels: { singular: 'Statystyka', plural: 'Statystyki' },
      maxRows: 8,
      fields: [
        { name: 'value', type: 'number', required: true, label: 'Wartość' },
        { name: 'suffix', type: 'text', label: 'Sufiks (np. +, %)' },
        { name: 'label', type: 'text', required: true, label: 'Opis' },
      ],
    },
  ],
}
