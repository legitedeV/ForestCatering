# Visual Template B — "Glass Forest"

> **Applied to:** Offer page (`/oferta`), Pricing (`/pakiety`)
> **Style:** Glass morphism cards, background orbs, warm accent hover effects

## Key CSS Classes Used

| Class | Purpose |
|-------|---------|
| `glass-card` | Frosted glass effect with backdrop blur |
| `bg-orbs` | Background gradient blobs for depth |
| `warm-glow` | Golden glow on hover |
| `noise-overlay` | Subtle noise texture |
| `btn-ripple` | Radial gradient ripple on button hover |

## Color Tokens

```
bg-accent-warm         → #D4A853 (golden CTA)
border-accent-warm     → golden border for featured items
text-accent-warm       → golden text for prices/checkmarks
bg-accent-warm/10      → subtle golden bg tint
```

## How to Apply to Any Page

### 1. Glass morphism card
```tsx
<article className="glass-card warm-glow relative flex flex-col p-8 transition hover:scale-[1.02]">
  <h3 className="text-2xl font-semibold text-cream">Card Title</h3>
  <p className="mt-2 text-lg font-medium text-accent-warm">Price Info</p>
  <ul className="mt-5 space-y-2">
    <li className="text-sm text-forest-200">
      <span className="text-accent-warm">✓</span> Feature text
    </li>
  </ul>
</article>
```

### 2. Featured card (highlighted)
```tsx
<article className="glass-card warm-glow relative flex flex-col p-8 scale-105 border-accent-warm">
  <span className="absolute -top-3 right-6 rounded-full bg-accent-warm px-4 py-1 text-xs font-bold text-forest-950">
    Najpopularniejszy
  </span>
  {/* content */}
</article>
```

### 3. Section with orbs background
```tsx
<section className="bg-orbs bg-forest-950 py-20">
  <div className="mx-auto max-w-7xl px-4">
    {/* cards grid */}
  </div>
</section>
```

### 4. CTA section with noise overlay
```tsx
<section className="noise-overlay border-t border-accent-warm/20 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 py-20">
  <div className="mx-auto max-w-3xl text-center">
    <h2 className="text-3xl font-bold text-cream">Heading</h2>
    <button className="btn-ripple rounded-lg bg-accent-warm px-8 py-3.5 font-semibold text-forest-950 hover:bg-accent-warm-light">
      CTA Button
    </button>
  </div>
</section>
```

### 5. Pricing grid with featured item
```tsx
<div className="grid gap-8 md:grid-cols-3">
  {packages.map((pkg) => (
    <div className={`glass-card flex flex-col p-8 ${pkg.featured ? 'scale-105 border-accent-warm' : ''}`}>
      <h3 className="text-xl font-bold text-cream">{pkg.name}</h3>
      <p className="mt-2 text-2xl font-bold text-accent-warm">{pkg.price}</p>
      {/* features list */}
      <button className={pkg.featured
        ? 'bg-accent-warm text-forest-950 hover:bg-accent-warm-light'
        : 'border border-accent-warm text-accent-warm hover:bg-accent-warm/10'
      }>
        {pkg.ctaText}
      </button>
    </div>
  ))}
</div>
```
