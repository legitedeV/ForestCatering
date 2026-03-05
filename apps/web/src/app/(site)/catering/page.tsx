import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catering — Forest Hub',
  description: 'Premium catering services by Forest Hub.',
};

export default function CateringPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Catering</h1>
      <p className="text-lg text-muted-foreground">
        Odkryj naszą ofertę cateringową — od eleganckich bankietów po kameralne przyjęcia.
      </p>
    </main>
  );
}
