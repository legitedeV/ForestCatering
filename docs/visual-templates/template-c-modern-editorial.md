# Visual Template C — "Modern Editorial"

> **Applied to:** Shop page (`/sklep`)
> **Style:** Sticky filter bar, wider grid, quick-view overlay, warm accents

## Key CSS Classes Used

| Class | Purpose |
|-------|---------|
| `gradient-line` | Animated gradient line under headings |
| `warm-glow` | Golden glow on hover for product cards |
| Sticky filter bar | `sticky top-[72px] z-20 bg-forest-900/95 backdrop-blur-md` |
| Quick-view overlay | Image overlay appearing on hover |

## Color Tokens

```
bg-accent-warm         → #D4A853 (active filter pills, buttons)
border-accent-warm/50  → filter pill hover border
text-accent-warm       → prices, hover text
```

## How to Apply to Any Page

### 1. Page heading with gradient line
```tsx
<h1 className="text-3xl font-bold text-cream md:text-4xl">Page Title</h1>
<div className="mt-3 w-20 gradient-line" />
<p className="mt-4 text-forest-200">Subtitle text</p>
```

### 2. Sticky horizontal filter bar
```tsx
<div className="sticky top-[72px] z-20 -mx-4 border-b border-forest-800 bg-forest-900/95 px-4 py-3 backdrop-blur-md">
  {/* Category pills (horizontal scroll on mobile) */}
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
    <a className="shrink-0 rounded-full border px-4 py-1.5 text-sm border-accent-warm bg-accent-warm text-forest-950">
      Active
    </a>
    <a className="shrink-0 rounded-full border px-4 py-1.5 text-sm border-forest-700 bg-forest-800 text-forest-200 hover:border-accent-warm/50">
      Inactive
    </a>
  </div>

  {/* Secondary filters + sorting */}
  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
    <div className="flex flex-wrap gap-1.5">
      <a className="rounded-full border px-3 py-1 text-xs border-forest-700 bg-forest-800 text-forest-300">
        Filter Chip
      </a>
    </div>
    <div className="flex gap-1.5">
      <a className="rounded-full border px-3 py-1 text-xs border-forest-700 bg-forest-800 text-forest-300">
        Sort Option
      </a>
    </div>
  </div>
</div>
```

### 3. Wider product grid (4 columns)
```tsx
<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
  {/* product cards */}
</div>
```

### 4. Product card with quick-view overlay
```tsx
<div className="warm-glow group flex flex-col overflow-hidden rounded-xl border border-forest-700 bg-forest-800">
  <div className="relative aspect-[4/3] overflow-hidden">
    <img className="object-cover transition group-hover:scale-105" />
    {/* Quick-view overlay */}
    <div className="absolute inset-0 flex items-center justify-center bg-forest-950/60 opacity-0 transition group-hover:opacity-100">
      <span className="rounded-lg bg-accent-warm px-4 py-2 text-sm font-semibold text-forest-950">
        Szybki podgląd
      </span>
    </div>
  </div>
  <div className="p-5">
    <h3 className="font-semibold text-cream group-hover:text-accent-warm">Name</h3>
    <span className="text-lg font-bold text-accent-warm">Price</span>
    <button className="w-full rounded-lg bg-accent-warm py-2.5 text-sm font-semibold text-forest-950 hover:bg-accent-warm-light">
      Dodaj do koszyka
    </button>
  </div>
</div>
```

### 5. Results count
```tsx
<p className="mb-4 text-sm text-forest-400">Znalezione produkty: {count}</p>
```

### 6. Pagination with aria-current
```tsx
<a
  className="rounded-lg border border-accent-warm bg-accent-warm px-3 py-2 text-sm text-forest-950"
  aria-current="page"
>
  1
</a>
```
