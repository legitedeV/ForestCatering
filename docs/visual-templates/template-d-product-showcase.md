# Visual Template D — "Product Showcase"

> **Applied to:** Product detail page (`/sklep/[slug]`)
> **Style:** Image gallery with thumbnails, tabbed content, breadcrumbs, horizontal related products

## Key Components Used

| Component | Purpose |
|-----------|---------|
| `ProductImageGallery` | Client component with thumbnail navigation |
| `ProductTabs` | Tabbed content (Description / Allergens / Portions) |
| `Breadcrumbs` | Navigation breadcrumb trail |
| `product-scroll` | Horizontal scrollable related products |
| `btn-ripple` | Ripple effect on add-to-cart button |

## Color Tokens

```
text-accent-warm       → #D4A853 (prices)
bg-accent-warm         → golden add-to-cart button
border-accent-warm     → active thumbnail border, active tab
hover:text-accent-warm → breadcrumb link hover
```

## How to Apply to Any Page

### 1. Breadcrumbs
```tsx
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

<Breadcrumbs items={[
  { label: 'Parent', href: '/parent' },
  { label: 'Current Page' },
]} />
```

### 2. Image gallery with thumbnails
```tsx
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'

<ProductImageGallery
  images={[
    { url: '/image1.jpg', alt: 'Image 1' },
    { url: '/image2.jpg', alt: 'Image 2' },
  ]}
  productName="Product Name"
/>
```

### 3. Tabbed content
```tsx
import { ProductTabs } from '@/components/shop/ProductTabs'

<ProductTabs
  description="Product description text"
  allergens={[{ key: 'gluten', label: '🌾 Gluten' }]}
  dietary={[{ key: 'vegan', label: 'Wegańskie', color: 'bg-green-800/50 text-green-200' }]}
  weight="500g"
  servings={4}
/>
```

### 4. Tab styling pattern (reusable)
```tsx
{/* Tab buttons */}
<div className="flex gap-6 border-b border-forest-700">
  <button className="pb-3 text-sm font-medium border-b-2 border-accent-warm text-cream">
    Active Tab
  </button>
  <button className="pb-3 text-sm font-medium text-forest-400 hover:text-forest-200">
    Inactive Tab
  </button>
</div>
```

### 5. Price with warm accent
```tsx
<span className="text-2xl font-bold text-accent-warm">{price}</span>
```

### 6. Add to cart with ripple
```tsx
<button className="btn-ripple w-full rounded-lg bg-accent-warm py-3.5 text-base font-semibold text-forest-950 hover:bg-accent-warm-light">
  Dodaj do koszyka
</button>
```

### 7. Related products horizontal scroll
```tsx
<div className="product-scroll mt-8">
  {products.map((p) => (
    <div key={p.id} className="w-[280px] shrink-0 sm:w-[320px]">
      <ProductCard product={p} />
    </div>
  ))}
</div>
```

### 8. Quantity selector pattern
```tsx
<div className="flex items-center gap-3">
  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-700 bg-forest-700 text-cream hover:border-accent-warm">
    −
  </button>
  <span className="w-12 text-center text-lg font-semibold text-cream">{qty}</span>
  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-700 bg-forest-700 text-cream hover:border-accent-warm">
    +
  </button>
</div>
```
