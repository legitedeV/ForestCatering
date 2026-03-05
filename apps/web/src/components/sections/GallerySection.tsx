'use client';

import HorizontalScroll from '@/components/scroll/HorizontalScroll';
import RevealImage from '@/components/ui/RevealImage';

interface GalleryItem {
  label: string;
  src: string;
  alt: string;
}

const galleryItems: GalleryItem[] = [
  {
    label: 'Wesela',
    src: '/images/gallery/wesela-01.jpg',
    alt: 'Dekoracja weselna w leśnym stylu',
  },
  {
    label: 'Wesela',
    src: '/images/gallery/wesela-02.jpg',
    alt: 'Stół weselny z kwiatami',
  },
  {
    label: 'Eventy',
    src: '/images/gallery/eventy-01.jpg',
    alt: 'Event firmowy w plenerze',
  },
  {
    label: 'Bar',
    src: '/images/gallery/bar-01.jpg',
    alt: 'Mobilny bar koktajlowy',
  },
  {
    label: 'Catering',
    src: '/images/gallery/catering-01.jpg',
    alt: 'Eleganckie danie cateringowe',
  },
  {
    label: 'Eventy',
    src: '/images/gallery/eventy-02.jpg',
    alt: 'Konferencja z cateringiem',
  },
];

export default function GallerySection() {
  return (
    <section id="galeria" className="section-spacing">
      <div className="container-site mb-12">
        <h2
          className="text-gradient"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Galeria
        </h2>
      </div>

      <HorizontalScroll>
        {galleryItems.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="relative flex-shrink-0"
            style={{ width: 'clamp(280px, 30vw, 450px)' }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <RevealImage
                src={item.src}
                alt={item.alt}
                revealType="circle"
                className="h-full w-full object-cover"
              />
              {/* Category badge */}
              <div className="absolute bottom-4 left-4 z-10">
                <span
                  className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
