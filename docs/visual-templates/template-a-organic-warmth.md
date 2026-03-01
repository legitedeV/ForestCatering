# Visual Template A — "Organic Warmth"

> **Applied to:** Home page (`/`)
> **Style:** Warm golden accents, noise textures, floating elements, gradient lines

## Key CSS Classes Used

| Class | Purpose |
|-------|---------|
| `noise-overlay` | Subtle noise texture overlay on sections |
| `gradient-line` | Animated gradient underline (gold → green → gold) |
| `floating-stats` | Card that "floats" above previous section |
| `bg-orbs` | Background gradient blobs for visual depth |
| `warm-glow` | Golden glow on hover for cards |
| `bento-grid` | Asymmetric grid (first item spans 2 rows) |
| `product-scroll` | Horizontal scrollable product cards |
| `timeline-connector` | Horizontal line connecting timeline steps |

## Color Tokens

```
bg-accent-warm         → #D4A853 (golden primary)
bg-accent-warm-light   → #E8C97A (golden hover)
text-accent-warm       → #D4A853
border-accent-warm/30  → semi-transparent golden border
bg-accent-warm/10      → subtle golden background
```

## How to Apply to Any Page

### 1. Section with noise overlay
```tsx
<section className="noise-overlay bg-forest-950 py-20">
  {/* content */}
</section>
```

### 2. Heading with gradient underline
```tsx
<h2 className="text-3xl font-bold text-cream">Your Heading</h2>
<div className="mx-auto mt-4 h-[3px] w-32 gradient-line" />
```

### 3. Floating stats bar (overlaps previous section)
```tsx
<section className="bg-transparent py-6">
  <div className="floating-stats mx-auto max-w-5xl px-8 py-8">
    {/* stats content */}
  </div>
</section>
```

### 4. Cards with warm glow and bento grid
```tsx
<section className="bg-orbs bg-forest-950 py-20">
  <div className="bento-grid mt-12">
    <div className="warm-glow rounded-xl border border-white/10 bg-white/5 p-8">
      {/* card content */}
    </div>
  </div>
</section>
```

### 5. Horizontal scrollable products
```tsx
<div className="product-scroll mt-10">
  <div className="w-[280px] sm:w-[320px]">
    {/* product card */}
  </div>
</div>
```

### 6. Timeline steps (horizontal on desktop)
```tsx
<div className="hidden lg:flex lg:gap-0">
  <div className="timeline-connector flex flex-1 flex-col items-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-warm text-sm font-bold text-forest-950">
      1
    </div>
    <h3 className="mt-3 text-cream">Step Title</h3>
  </div>
</div>
```

### 7. Primary button (warm gold)
```tsx
<button className="rounded-lg bg-accent-warm px-8 py-3.5 text-base font-semibold text-forest-950 hover:bg-accent-warm-light">
  Call to Action
</button>
```

### 8. Badge (warm variant)
```tsx
<span className="rounded-full border border-accent-warm/30 bg-accent-warm/10 px-4 py-1.5 text-sm text-accent-warm">
  Badge Text
</span>
```
