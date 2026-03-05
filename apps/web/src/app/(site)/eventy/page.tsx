import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eventy — Forest Hub',
  description: 'Organizacja eventów firmowych i prywatnych.',
};

export default function EventyPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Eventy</h1>
      <p className="text-lg text-muted-foreground">
        Kompleksowa organizacja eventów — od konferencji po imprezy tematyczne.
      </p>
    </main>
  );
}
