import { notFound } from 'next/navigation';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getProduct } from '@/lib/prestashop/products';

const parseIdFromSlug = (slug: string): number => Number(slug.split('-')[0]);
const getName = (name: string | { value: string }[]) => (typeof name === 'string' ? name : name[0]?.value ?? 'Produkt');

export default async function MenuProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productId = parseIdFromSlug(slug);
  if (!productId) {
    notFound();
  }

  const productResult = await getProduct(productId);
  if (productResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać produktu." />;
  }

  const product = productResult.data;
  if (!product) {
    return <EmptyState title="Nie znaleziono produktu" description="Sprawdź poprawność adresu URL." />;
  }

  return (
    <article className="space-y-5 rounded-2xl border border-fc-accent/25 bg-fc-surface p-6">
      <div className="h-64 rounded-xl bg-gradient-to-br from-fc-accent/20 via-fc-surface to-fc-accent2/20" />
      <h1 className="text-3xl font-bold">{getName(product.name)}</h1>
      <p className="text-fc-accent">{Number(product.price).toFixed(2)} PLN</p>
      <p className="text-fc-muted">Dostępna ilość: {product.quantity ?? '0'}</p>
      <button type="button" className="rounded-full bg-fc-accent px-5 py-2 font-semibold text-black">
        Dodaj do koszyka
      </button>
    </article>
  );
}
