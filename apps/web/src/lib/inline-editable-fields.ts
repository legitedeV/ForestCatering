/**
 * Maps block types to their inline-editable fields.
 * Used by PreviewClient to mark DOM elements as inline-editable.
 * fieldPath follows setNestedField notation (e.g. "heading", "items.0.title").
 */
export interface InlineEditableField {
  selector: string           // CSS selector relative to [data-block-id]
  fieldPath: string          // store fieldPath for updateBlockField
  label: string              // displayed in mini info bar
  multiline?: boolean        // Enter = newline (true) or commit (false)
}

export const INLINE_EDITABLE_FIELDS: Record<string, InlineEditableField[]> = {
  hero: [
    { selector: 'h1', fieldPath: 'heading', label: 'Nagłówek' },
    { selector: 'p:first-of-type', fieldPath: 'subheading', label: 'Podtytuł' },
  ],
  cta: [
    { selector: 'h2, h3', fieldPath: 'heading', label: 'Nagłówek CTA' },
    { selector: 'p', fieldPath: 'text', label: 'Tekst CTA', multiline: true },
  ],
  services: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek sekcji' },
  ],
  about: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek' },
  ],
  stats: [],
  richText: [],
  gallery: [],
  galleryFull: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek galerii' },
  ],
  testimonials: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek opinii' },
  ],
  faq: [],
  pricing: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek cennika' },
  ],
  steps: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek kroków' },
  ],
  contactForm: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek formularza' },
  ],
  legalText: [
    { selector: 'h1, h2', fieldPath: 'heading', label: 'Nagłówek' },
  ],
  partners: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek partnerów' },
  ],
  team: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek zespołu' },
  ],
  mapArea: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek mapy' },
  ],
  offerCards: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek ofert' },
  ],
  featuredProducts: [
    { selector: 'h2', fieldPath: 'heading', label: 'Nagłówek produktów' },
  ],
}
