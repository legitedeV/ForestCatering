// Metadane bloków do UI edytora stron

export interface BlockMeta {
  type: string          // blockType
  label: string         // wyświetlana nazwa PL
  icon: string          // emoji
  description: string   // krótki opis PL
  category: 'content' | 'media' | 'commerce' | 'layout' | 'form'
}

export const BLOCK_CATALOG: BlockMeta[] = [
  { type: 'hero', label: 'Hero', icon: '🎬', description: 'Sekcja hero z tłem, nagłówkiem i CTA', category: 'layout' },
  { type: 'richText', label: 'Tekst', icon: '📝', description: 'Sekcja z bogatym tekstem (Lexical)', category: 'content' },
  { type: 'stats', label: 'Statystyki', icon: '📊', description: 'Liczniki z animacją', category: 'content' },
  { type: 'services', label: 'Usługi', icon: '🍽️', description: 'Lista usług z ikonami', category: 'content' },
  { type: 'featuredProducts', label: 'Polecane produkty', icon: '⭐', description: 'Siatka wyróżnionych produktów', category: 'commerce' },
  { type: 'about', label: 'O nas', icon: '👨‍🍳', description: 'Sekcja o firmie z obrazem', category: 'content' },
  { type: 'gallery', label: 'Galeria', icon: '🖼️', description: 'Galeria zdjęć (max 24)', category: 'media' },
  { type: 'galleryFull', label: 'Galeria pełna', icon: '🎨', description: 'Galeria z kategoriami i etykietami', category: 'media' },
  { type: 'testimonials', label: 'Opinie', icon: '💬', description: 'Karuzela opinii klientów', category: 'content' },
  { type: 'cta', label: 'CTA', icon: '📢', description: 'Sekcja wezwania do działania', category: 'layout' },
  { type: 'faq', label: 'FAQ', icon: '❓', description: 'Pytania i odpowiedzi (max 12)', category: 'content' },
  { type: 'pricing', label: 'Cennik', icon: '💰', description: 'Pakiety cenowe z funkcjami', category: 'commerce' },
  { type: 'steps', label: 'Kroki', icon: '👣', description: 'Kroki procesu z emoji', category: 'content' },
  { type: 'contactForm', label: 'Formularz kontaktowy', icon: '✉️', description: 'Formularz kontaktowy z mapą', category: 'form' },
  { type: 'legalText', label: 'Tekst prawny', icon: '📜', description: 'Regulamin lub polityka prywatności', category: 'content' },
  { type: 'partners', label: 'Partnerzy', icon: '🤝', description: 'Logo partnerów (siatka/karuzela)', category: 'content' },
  { type: 'team', label: 'Zespół', icon: '👥', description: 'Karty członków zespołu', category: 'content' },
  { type: 'mapArea', label: 'Obszar dostawy', icon: '🗺️', description: 'Mapa z osadzoną mapą Google', category: 'layout' },
  { type: 'offerCards', label: 'Karty ofert', icon: '🃏', description: 'Karty ofertowe z cenami i funkcjami', category: 'commerce' },
]
