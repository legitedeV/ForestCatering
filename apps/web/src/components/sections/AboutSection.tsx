'use client';

import PinnedSection from '@/components/scroll/PinnedSection';
import RevealImage from '@/components/ui/RevealImage';
import TextReveal from '@/components/scroll/TextReveal';
import ParallaxLayer from '@/components/scroll/ParallaxLayer';

export default function AboutSection() {
  return (
    <section
      id="o-nas"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <PinnedSection pinDuration={1.5}>
        <div className="container-site grid min-h-screen items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* Left — Image with circle reveal */}
          <ParallaxLayer speed={0.3}>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
              <RevealImage
                src="/images/about-forest.jpg"
                alt="Zespół Forest Hub w akcji"
                revealType="circle"
                className="h-full w-full object-cover"
              />
            </div>
          </ParallaxLayer>

          {/* Right — Text */}
          <ParallaxLayer speed={0.6}>
            <div className="flex flex-col gap-6">
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                <TextReveal mode="char" stagger={0.03} className="text-gradient">
                  Kim jesteśmy
                </TextReveal>
              </div>

              <div
                className="max-w-lg text-lg leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <TextReveal mode="word" stagger={0.04}>
                  Forest Hub to zespół pasjonatów gastronomii i eventów ze Szczecina. Od ponad dekady tworzymy niezapomniane doświadczenia kulinarne — od kameralnych spotkań po wielkie wesela. Naszą misją jest łączenie natury z nowoczesną kuchnią.
                </TextReveal>
              </div>

              <div
                className="max-w-lg leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <TextReveal mode="word" stagger={0.04}>
                  Każde wydarzenie traktujemy indywidualnie, dbając o każdy szczegół — od menu po dekoracje. Zaufaj nam, a stworzymy coś wyjątkowego.
                </TextReveal>
              </div>
            </div>
          </ParallaxLayer>
        </div>
      </PinnedSection>
    </section>
  );
}
