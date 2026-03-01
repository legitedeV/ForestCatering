export interface AnimationDefinition {
  key: string
  label: string
  description: string
  category: 'entrance' | 'continuous' | 'stagger' | 'decorative'
  type: 'css' | 'framer'
  className?: string
  framerVariant?: string
  preview: string
}

export const ANIMATION_CATALOG: AnimationDefinition[] = [
  // === ENTRANCE (trigger on scroll) ===
  { key: 'fade-up', label: 'Fade Up', description: 'Wysuń w górę', category: 'entrance', type: 'framer', framerVariant: 'fadeUp', preview: '↑ opacity + y' },
  { key: 'fade-up-soft', label: 'Fade Up (Soft)', description: 'Delikatne wysunięcie', category: 'entrance', type: 'css', className: 'anim-fade-up-soft', preview: '↑ subtle' },
  { key: 'fade-down', label: 'Fade Down', description: 'Wysuń z góry', category: 'entrance', type: 'css', className: 'anim-fade-down', preview: '↓ opacity' },
  { key: 'fade-in', label: 'Fade In', description: 'Pojawienie', category: 'entrance', type: 'framer', framerVariant: 'fadeIn', preview: 'opacity' },
  { key: 'slide-left', label: 'Slide Left', description: 'Wsuń od lewej', category: 'entrance', type: 'framer', framerVariant: 'slideLeft', preview: '← slide' },
  { key: 'slide-right', label: 'Slide Right', description: 'Wsuń od prawej', category: 'entrance', type: 'framer', framerVariant: 'slideRight', preview: '→ slide' },
  { key: 'slide-left-bounce', label: 'Slide Left (Bounce)', description: 'Wsuń od lewej ze sprężyną', category: 'entrance', type: 'css', className: 'anim-slide-left-bounce', preview: '← bounce' },
  { key: 'slide-right-bounce', label: 'Slide Right (Bounce)', description: 'Wsuń od prawej ze sprężyną', category: 'entrance', type: 'css', className: 'anim-slide-right-bounce', preview: '→ bounce' },
  { key: 'scale-up', label: 'Scale Up', description: 'Powiększ wejście', category: 'entrance', type: 'framer', framerVariant: 'scaleUp', preview: '⤢ scale' },
  { key: 'scale-elastic', label: 'Scale Elastic', description: 'Sprężyste powiększenie', category: 'entrance', type: 'css', className: 'anim-scale-elastic', preview: '⤢ spring' },
  { key: 'rotate-in', label: 'Rotate In', description: 'Obrót z fade', category: 'entrance', type: 'css', className: 'anim-rotate-in', preview: '↻ rotate' },
  { key: 'blur-in', label: 'Blur In', description: 'Rozmycie → ostre', category: 'entrance', type: 'css', className: 'anim-blur-in', preview: '◉ blur→clear' },
  { key: 'flip-y', label: 'Flip Y', description: 'Obrót wokół osi Y', category: 'entrance', type: 'css', className: 'anim-flip-y', preview: '🔄 Y-axis' },
  { key: 'flip-x', label: 'Flip X', description: 'Obrót wokół osi X', category: 'entrance', type: 'css', className: 'anim-flip-x', preview: '🔄 X-axis' },
  { key: 'clip-reveal', label: 'Clip Reveal', description: 'Odsłonięcie od dołu', category: 'entrance', type: 'css', className: 'anim-clip-reveal', preview: '▐ wipe up' },
  { key: 'clip-left', label: 'Clip Left', description: 'Odsłonięcie od lewej', category: 'entrance', type: 'css', className: 'anim-clip-left', preview: '▐ wipe right' },
  { key: 'bounce-in', label: 'Bounce In', description: 'Wskocz z bounce', category: 'entrance', type: 'css', className: 'anim-bounce-in', preview: '⊚ bounce' },
  { key: 'zoom-out', label: 'Zoom Out', description: 'Z dużego do normalnego', category: 'entrance', type: 'framer', framerVariant: 'zoomOut', preview: '⤡ zoom out' },

  // === CONTINUOUS (infinite) ===
  { key: 'pulse-glow', label: 'Pulse Glow', description: 'Ciągły puls poświaty', category: 'continuous', type: 'css', className: 'anim-pulse-glow', preview: '💛 pulse' },
  { key: 'float', label: 'Float', description: 'Delikatne unoszenie', category: 'continuous', type: 'css', className: 'anim-float', preview: '☁️ float' },
  { key: 'breathe', label: 'Breathe', description: 'Oddychanie (skala)', category: 'continuous', type: 'css', className: 'anim-breathe', preview: '🫁 breathe' },
  { key: 'shimmer', label: 'Shimmer', description: 'Połysk premium', category: 'continuous', type: 'css', className: 'anim-shimmer-fast', preview: '✨ shimmer' },
  { key: 'border-trace', label: 'Border Trace', description: 'Animowane obramowanie', category: 'continuous', type: 'css', className: 'anim-border-trace', preview: '⬡ border' },
  { key: 'gradient-text', label: 'Gradient Text', description: 'Tekst z animowanym gradientem', category: 'continuous', type: 'css', className: 'anim-gradient-text', preview: '🌈 text' },
  { key: 'gentle-rotate', label: 'Gentle Rotate', description: 'Powolny obrót', category: 'continuous', type: 'css', className: 'anim-gentle-rotate', preview: '🔄 slow' },

  // === STAGGER (children) ===
  { key: 'stagger-default', label: 'Stagger Default', description: 'Kaskada domyślna', category: 'stagger', type: 'css', className: 'reveal-stagger', preview: '▓▓▓ stagger' },
  { key: 'cascade', label: 'Cascade', description: 'Kaskada ze sprężyną', category: 'stagger', type: 'css', className: 'anim-cascade', preview: '▓▓▓ cascade' },

  // === DECORATIVE (background) ===
  { key: 'morph-bg', label: 'Morph BG', description: 'Animowane tło kolorami', category: 'decorative', type: 'css', className: 'anim-morph-bg', preview: '🎨 bg morph' },
  { key: 'parallax-drift', label: 'Parallax Drift', description: 'Powolny ruch parallax', category: 'decorative', type: 'css', className: 'anim-parallax-slow', preview: '↕️ parallax' },
]

export const ANIMATION_CATEGORIES = [
  { key: 'entrance', label: '🎬 Wejścia', description: 'Animacje pojawiania na scroll' },
  { key: 'continuous', label: '♾️ Ciągłe', description: 'Nieskończone animacje' },
  { key: 'stagger', label: '📊 Kaskadowe', description: 'Animacje dzieci z opóźnieniem' },
  { key: 'decorative', label: '🎨 Dekoracyjne', description: 'Efekty tła i parallax' },
] as const
