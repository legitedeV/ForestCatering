'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import TextReveal from '@/components/scroll/TextReveal';
import FloatingCard from '@/components/ui/FloatingCard';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

const services: ServiceItem[] = [
  {
    icon: '🍸',
    title: 'Bar',
    description:
      'Mobilny bar z profesjonalną obsługą barmańską. Autorskie koktajle, klasyki i napoje bezalkoholowe.',
  },
  {
    icon: '🍽️',
    title: 'Catering dzienny',
    description:
      'Codzienny catering dla firm i biur. Świeże, sezonowe menu dostarczane prosto pod drzwi.',
  },
  {
    icon: '🎉',
    title: 'Eventy',
    description:
      'Obsługa imprez firmowych, konferencji i eventów prywatnych. Kompleksowa organizacja od A do Z.',
  },
  {
    icon: '💍',
    title: 'Wesela',
    description:
      'Twoje wymarzone wesele w leśnym stylu. Menu degustacyjne, dekoracje i pełna koordynacja.',
  },
  {
    icon: '✨',
    title: 'Chrzciny i Komunie',
    description:
      'Eleganckie przyjęcia rodzinne z dbałością o tradycję i nowoczesny smak.',
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.service-card');

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
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
      id="uslugi"
      ref={sectionRef}
      className="section-spacing relative"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
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
            <TextReveal mode="char" stagger={0.03} className="text-gradient">
              Co oferujemy
            </TextReveal>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div
          ref={cardsRef}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <FloatingCard className="flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] p-8 transition-colors hover:border-white/[0.12]">
                <span className="text-4xl">{service.icon}</span>
                <h3
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {service.description}
                </p>
              </FloatingCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
