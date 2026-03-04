export interface TemplateDefinition {
  key: string
  name: string
  description: string
  icon: string
  appliedTo: string
  cssClasses: string[]
  colorOverrides: Record<string, string>
  previewGradient: string
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    key: 'organic-warmth',
    name: 'Organic Warmth',
    description: 'Ciepłe złoto, textury noise, elementy floating',
    icon: '🌿',
    appliedTo: 'Strona główna',
    cssClasses: ['noise-overlay', 'floating-stats', 'bg-orbs', 'warm-glow', 'bento-grid', 'product-scroll', 'timeline-connector'],
    colorOverrides: {
      '--color-accent-warm': '#D4A853',
      '--color-accent-warm-light': '#E8C97A',
    },
    previewGradient: 'linear-gradient(135deg, #D4A853 0%, #4A7C59 100%)',
  },
  {
    key: 'glass-forest',
    name: 'Glass Forest',
    description: 'Glass morphism, background orbs, ciepłe akcenty',
    icon: '🪟',
    appliedTo: 'Oferta, Pakiety',
    cssClasses: ['glass-card', 'bg-orbs', 'warm-glow', 'noise-overlay', 'btn-ripple'],
    colorOverrides: {
      '--color-accent-warm': '#D4A853',
    },
    previewGradient: 'linear-gradient(135deg, rgba(31,36,43,0.8) 0%, rgba(74,124,89,0.4) 100%)',
  },
  {
    key: 'modern-editorial',
    name: 'Modern Editorial',
    description: 'Sticky filtry, wider grid, quick-view overlay',
    icon: '📰',
    appliedTo: 'Sklep',
    cssClasses: [],
    colorOverrides: {},
    previewGradient: 'linear-gradient(135deg, #333A43 0%, #4A535E 100%)',
  },
  {
    key: 'product-showcase',
    name: 'Product Showcase',
    description: 'Galeria zdjęć, zakładki, breadcrumbs',
    icon: '🎁',
    appliedTo: 'Detal produktu',
    cssClasses: ['btn-ripple', 'product-scroll'],
    colorOverrides: {},
    previewGradient: 'linear-gradient(135deg, #4A535E 0%, #D4A853 100%)',
  },
  {
    key: 'enhanced-navigation',
    name: 'Enhanced Navigation',
    description: 'Ciepła nawigacja, cart pulse, scroll-to-top',
    icon: '🧭',
    appliedTo: 'Cały serwis (stały)',
    cssClasses: [],
    colorOverrides: {
      '--color-accent-warm': '#D4A853',
    },
    previewGradient: 'linear-gradient(135deg, #12161B 0%, #D4A853 100%)',
  },
]

export const DEFAULT_CSS_VARIABLES: Record<string, string> = {
  '--color-accent-warm': '#D4A853',
  '--color-accent': '#7E8896',
  '--color-forest-green': '#4A7C59',
  '--color-cream': '#E6E9ED',
  '--background': '#1F242B',
  '--foreground': '#F3F5F7',
}
