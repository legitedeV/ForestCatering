import { ProductGrid } from '@/components/products/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getCategories } from '@/lib/prestashop/categories';
import { getProducts } from '@/lib/prestashop/products';
import type { PSCategory } from '@/lib/prestashop/types';

const getName = (name: string | { value: string }[]) => (typeof name === 'string' ? name : name[0]?.value ?? '');

export default async function EventyPage() {
  const categoriesResult = await getCategories();
  if (categoriesResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać kategorii Eventy." />;
  }

  const category = (categoriesResult.data ?? []).find((entry) => getName(entry.name).toLowerCase() === 'eventy');
  if (!category) {
    return <EmptyState title="Eventy są chwilowo niedostępne" description="Spróbuj ponownie za chwilę." />;
  }

  const categories = categoriesResult.data ?? [];
  const descendantIds = new Set<number>();
  const mapByParent = categories.reduce<Record<number, PSCategory[]>>((acc, item) => {
    const parentId = Number(item.id_parent);
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(item);
    return acc;
  }, {});

  const collect = (categoryId: number) => {
    descendantIds.add(categoryId);
    (mapByParent[categoryId] ?? []).forEach((child) => collect(child.id));
  };
  collect(category.id);

  const productsResult = await getProducts();
  if (productsResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać pakietów eventowych." />;
  }

  const products = (productsResult.data ?? []).filter((product) => {
    const productCategories = product.associations?.categories ?? [];
    return productCategories.some((entry) => descendantIds.has(Number(entry.id)));
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Eventy</h1>
      <ProductGrid products={products} businessType="event" />
    </div>
  );
}
