'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import TextReveal from '@/components/scroll/TextReveal';

interface Testimonial {
  quote: string;
  author: string;
  eventType: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Forest Hub sprawił, że nasze wesele było magiczne. Goście do dziś wspominają jedzenie i atmosferę!',
    author: 'Anna & Michał',
    eventType: 'Wesele',
    stars: 5,
  },
  {
    quote:
      'Profesjonalizm na najwyższym poziomie. Bar koktajlowy był hitem naszego eventu firmowego.',
    author: 'Tomasz K.',
    eventType: 'Event firmowy',
    stars: 5,
  },
  {
    quote:
      'Catering dzienny dla naszego biura — świeże, smaczne i zawsze na czas. Polecamy!',
    author: 'Marta S.',
    eventType: 'Catering dzienny',
    stars: 5,
  },
  {
    quote:
      'Chrzciny naszego synka były perfekcyjne dzięki Forest Hub. Każdy szczegół dopięty na ostatni guzik.',
    author: 'Karolina & Piotr',
    eventType: 'Chrzciny',
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`Ocena: ${count} z 5 gwiazdek`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="text-sm"
          style={{ color: i < count ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.testimonial-card');

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        rotateX: 8,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-spacing"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="container-site">
        {/* Heading */}
        <div className="mb-16 text-center md:mb-24">
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            <TextReveal mode="word" stagger={0.06} className="text-gradient">
              Co mówią nasi klienci
            </TextReveal>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div
          ref={cardsRef}
          className="grid gap-6 md:grid-cols-2"
          style={{ perspective: '1200px' }}
        >
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="testimonial-card rounded-2xl border border-white/[0.06] p-8 transition-colors hover:border-white/[0.12]"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                transformStyle: 'preserve-3d',
              }}
            >
              <Stars count={t.stars} />
              <blockquote
                className="mt-4 text-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center justify-between">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {t.author}
                </span>
                <span
                  className="text-xs uppercase tracking-[0.15em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {t.eventType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
