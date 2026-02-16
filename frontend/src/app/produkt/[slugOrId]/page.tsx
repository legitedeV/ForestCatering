import { notFound } from 'next/navigation';

import { getProduct } from '@/lib/prestashop/products';

const extractId = (slugOrId: string): number | null => {
  const parts = slugOrId.split('-');
  const lastPart = parts[parts.length - 1];
  const parsed = Number(lastPart);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const renderName = (value: string | { value: string }[] | undefined): string => {
  if (!value) {
    return 'Produkt';
  }
  return typeof value === 'string' ? value : value[0]?.value ?? 'Produkt';
};

export default async function ProductPage({ params }: { params: Promise<{ slugOrId: string }> }) {
  const { slugOrId } = await params;
  const id = extractId(slugOrId);

  if (!id) {
    notFound();
  }

  const productResult = await getProduct(id);
  if (!productResult.data) {
    return <p className="text-fc-muted">Nie znaleziono produktu lub brak dostępu do API.</p>;
  }

  const product = productResult.data;

  return (
    <article className="space-y-4">
      <p className="text-sm uppercase tracking-[0.12em] text-fc-accent">Produkt #{product.id}</p>
      <h1 className="text-3xl font-bold">{renderName(product.name)}</h1>
      <p className="text-xl font-semibold">Cena: {product.price} PLN</p>
      <p className="text-fc-muted">Minimalna ilość: {product.minimal_quantity ?? '1'}</p>
    </article>
  );
}
