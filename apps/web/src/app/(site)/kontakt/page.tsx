import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt — Forest Hub',
  description: 'Skontaktuj się z nami — Forest Hub.',
};

export default function KontaktPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Kontakt</h1>
      <p className="text-lg text-muted-foreground">
        Masz pytania? Napisz do nas lub zadzwoń — chętnie pomożemy.
      </p>
    </main>
  );
}
