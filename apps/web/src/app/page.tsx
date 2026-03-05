import type { Metadata } from 'next';

import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WeddingsSection from '@/components/sections/WeddingsSection';
import GallerySection from '@/components/sections/GallerySection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import StatsSection from '@/components/sections/StatsSection';
import ContactSection from '@/components/sections/ContactSection';

export const metadata: Metadata = {
  title: 'Forest Hub — Catering & Bar Szczecin',
  description:
    'Forest Hub — wesela, catering, bar mobilny i eventy w Szczecinie. Tworzymy niezapomniane doświadczenia kulinarne.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WeddingsSection />
      <GallerySection />
      <TestimonialsSection />
      <StatsSection />
      <ContactSection />
    </>
  );
}
