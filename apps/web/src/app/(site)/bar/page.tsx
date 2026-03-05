import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bar — Forest Hub',
  description: 'Forest Bar — wyjątkowe koktajle i obsługa barmańska.',
};

export default function BarPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Bar</h1>
      <p className="text-lg text-muted-foreground">
        Profesjonalna obsługa barmańska na każdą okazję.
      </p>
    </main>
  );
}
