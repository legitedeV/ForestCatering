# Visual Template E — "Enhanced Navigation" (Permanent)

> **Applied to:** Entire site (Navbar, MobileMenu, Footer)
> **Style:** Warm accent navigation, cart badge pulse, social info, scroll-to-top

## Key Components Used

| Component | Purpose |
|-----------|---------|
| `Navbar` | Enhanced navbar with warm accents, phone display |
| `MobileMenu` | Slide-out menu with social info |
| `ScrollToTop` | Fixed scroll-to-top button |
| `Breadcrumbs` | Page navigation breadcrumbs |

## Color Tokens

```
hover:text-accent-warm → link hover color (replaces hover:text-accent)
bg-accent-warm         → cart badge, active underline
border-accent-warm     → thumbnail/tab active borders
```

## How to Apply Navigation Pattern

### 1. Nav link with animated underline
```tsx
import { motion } from 'framer-motion'

<Link href="/page" className="relative text-sm font-medium text-cream/80 transition hover:text-accent-warm">
  Link Label
  {isActive && (
    <motion.span
      layoutId="nav-underline"
      className="absolute -bottom-1 left-0 h-[2px] w-full bg-accent-warm"
      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
    />
  )}
</Link>
```

### 2. Cart badge with pulse animation
```tsx
import { motion } from 'framer-motion'

<motion.span
  key={itemCount}
  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-warm text-xs font-bold text-forest-950"
  animate={itemCount > prevCount ? { scale: [1, 1.3, 1] } : undefined}
  transition={{ duration: 0.3 }}
>
  {itemCount}
</motion.span>
```

### 3. Logo with hover effect
```tsx
<Link href="/" className="text-xl font-bold text-cream transition hover:text-accent-warm">
  🌲 Company Name
</Link>
```

### 4. Desktop phone display
```tsx
{contactPhone && (
  <a
    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
    className="hidden items-center gap-1 text-sm text-forest-300 transition hover:text-accent-warm xl:flex"
  >
    📞 {contactPhone}
  </a>
)}
```

### 5. Mobile menu with separator and social info
```tsx
{/* After nav links */}
<div className="my-6 h-px w-24 bg-forest-700" />

{/* Bottom contact info */}
<div className="flex flex-col items-center gap-3 text-forest-300">
  {phone && <a href={`tel:${phone}`} className="text-sm hover:text-accent-warm">📞 {phone}</a>}
  {email && <a href={`mailto:${email}`} className="text-sm hover:text-accent-warm">✉️ {email}</a>}
  <div className="mt-2 flex gap-4">
    {facebook && <a href={facebook} className="text-sm hover:text-accent-warm">Facebook</a>}
    {instagram && <a href={instagram} className="text-sm hover:text-accent-warm">Instagram</a>}
  </div>
</div>
```

### 6. Scroll to top button
```tsx
import { ScrollToTop } from '@/components/ui/ScrollToTop'

{/* Place in Footer or Layout */}
<ScrollToTop />
```

### 7. Breadcrumbs on subpages
```tsx
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

<Breadcrumbs items={[
  { label: 'Parent Page', href: '/parent' },
  { label: 'Current Page' },
]} />
```

### 8. Passing social props through layout
```tsx
// In layout.tsx
<Navbar
  links={links}
  companyName={companyName}
  contactPhone={settings?.phone}
  email={settings?.email}
  socialFacebook={settings?.socialLinks?.facebook}
  socialInstagram={settings?.socialLinks?.instagram}
/>
```
