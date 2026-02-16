import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductGrid } from '@/components/products/ProductGrid';
import { getCategory } from '@/lib/prestashop/categories';
import { getProductsByCategory } from '@/lib/prestashop/products';

const extractId = (slugOrId: string): number | null => {
  const parts = slugOrId.split('-');
  const lastPart = parts[parts.length - 1];
  const parsed = Number(lastPart);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const renderName = (value: string | { value: string }[] | undefined): string => {
  if (!value) {
    return 'Kategoria';
  }
  return typeof value === 'string' ? value : value[0]?.value ?? 'Kategoria';
};

export default async function CategoryPage({ params }: { params: Promise<{ slugOrId: string }> }) {
  const { slugOrId } = await params;
  const id = extractId(slugOrId);

  if (!id) {
    notFound();
  }

  const [categoryResult, productsResult] = await Promise.all([getCategory(id), getProductsByCategory(id)]);

  if (!categoryResult.data) {
    return <p className="text-fc-muted">Nie znaleziono kategorii lub brak dostępu do API.</p>;
  }

  const category = categoryResult.data;
  const products = productsResult.data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.12em] text-fc-accent">Kategoria #{category.id}</p>
        <h1 className="text-3xl font-bold">{renderName(category.name)}</h1>
      </div>

      {products.length ? (
        <ProductGrid products={products} businessType={null} isLoading={false} />
      ) : (
        <p className="text-fc-muted">Brak aktywnych produktów w tej kategorii.</p>
      )}

      <Link href="/" className="inline-block rounded-full border border-fc-accent/40 px-5 py-2 font-semibold">
        Wróć na stronę główną
      </Link>
    </section>
  );
}
