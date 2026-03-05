import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wesela — Forest Hub',
  description: 'Organizacja wesel i przyjęć ślubnych z Forest Hub.',
};

export default function WeselaPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Wesela</h1>
      <p className="text-lg text-muted-foreground">
        Twoje wymarzone wesele w leśnej scenerii — elegancja, smak i niezapomniane chwile.
      </p>
    </main>
  );
}
