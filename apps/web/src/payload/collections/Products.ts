import type { CollectionConfig } from 'payload'
import { populateSlug } from '../hooks/populateSlug'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'isAvailable', 'isFeatured'],
  },
  hooks: {
    // slug generowany z nazwy – ważne przy tworzeniu w panelu
    beforeValidate: [populateSlug],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // ────────────────── PODSTAWOWE DANE ──────────────────
    { name: 'name', type: 'text', required: true, maxLength: 200, label: 'Nazwa' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'Automatycznie z nazwy, możesz nadpisać ręcznie.',
      },
    },
    { name: 'shortDescription', type: 'textarea', maxLength: 300, label: 'Krótki opis' },
    { name: 'description', type: 'richText', label: 'Pełny opis' },

    // ────────────────── CENA ──────────────────
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Cena',
      admin: { description: 'Cena w groszach (3599 = 35,99 PLN)' },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      label: 'Cena przed rabatem',
      admin: { description: 'Cena przed rabatem w groszach' },
    },

    // ────────────────── KATEGORIA ──────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Kategoria',
    },

    // ────────────────── MEDIA / PREZENTACJA ──────────────────
    {
      type: 'collapsible',
      label: 'Media i prezentacja',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'images',
          type: 'array',
          minRows: 0,
          maxRows: 8,
          label: 'Zdjęcia (upload)',
          labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Zdjęcie',
            },
          ],
        },
        {
          name: 'imageUrl',
          type: 'text',
          label: 'Zewnętrzny URL zdjęcia (np. Unsplash)',
          admin: {
            description:
              'Jeśli ustawione, frontend może używać tego URL zamiast pierwszego zdjęcia z uploadu.',
          },
        },
        {
          name: 'unsplashId',
          type: 'text',
          label: 'Unsplash photo ID',
          admin: {
            description:
              'ID zdjęcia z Unsplash (część z URL). Seeder może to nadpisywać automatycznie.',
          },
        },
        {
          name: 'color',
          type: 'text',
          label: 'Kolor akcentu (HEX)',
          admin: {
            description: 'Używany np. w kafelkach produktu, np. #4A7C59.',
          },
          validate: (value: unknown) => {
            if (!value) return true
            if (typeof value !== 'string') return 'Nieprawidłowy format koloru.'
            return /^#([0-9a-fA-F]{3}){1,2}$/.test(value)
              ? true
              : 'Podaj poprawny HEX, np. #4A7C59.'
          },
        },
      ],
    },

    // ────────────────── ALERGENY / DIETY ──────────────────
    {
      name: 'allergens',
      type: 'select',
      hasMany: true,
      label: 'Alergeny',
      options: [
        { label: 'Gluten', value: 'gluten' },
        { label: 'Nabiał', value: 'dairy' },
        { label: 'Jaja', value: 'eggs' },
        { label: 'Orzechy', value: 'nuts' },
        { label: 'Soja', value: 'soy' },
        { label: 'Ryby', value: 'fish' },
        { label: 'Skorupiaki', value: 'shellfish' },
        { label: 'Seler', value: 'celery' },
        { label: 'Gorczyca', value: 'mustard' },
        { label: 'Sezam', value: 'sesame' },
        { label: 'Łubin', value: 'lupine' },
        { label: 'Mięczaki', value: 'mollusks' },
      ],
    },
    {
      name: 'dietary',
      type: 'select',
      hasMany: true,
      label: 'Diety',
      options: [
        { label: 'Wegetariańskie', value: 'vegetarian' },
        { label: 'Wegańskie', value: 'vegan' },
        { label: 'Bezglutenowe', value: 'gluten-free' },
        { label: 'Low-carb', value: 'low-carb' },
      ],
    },

    // ────────────────── PARAMETRY PORCJI ──────────────────
    { name: 'weight', type: 'text', label: 'Waga' },
    { name: 'servings', type: 'number', min: 1, label: 'Liczba porcji' },

    // ────────────────── TYP PRODUKTU ──────────────────
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'catering',
      label: 'Typ produktu',
      options: [
        { label: 'Catering', value: 'catering' },
        { label: 'Event', value: 'event' },
        { label: 'Bar', value: 'bar' },
      ],
    },

    // ────────────────── STATUS / SORTOWANIE ──────────────────
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      label: 'Dostępny',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Wyróżniony',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Kolejność sortowania',
      admin: { position: 'sidebar' },
    },
  ],
}
