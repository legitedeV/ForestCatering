import { ProductGrid } from '@/components/products/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getCategories } from '@/lib/prestashop/categories';
import { getProducts } from '@/lib/prestashop/products';
import type { PSCategory } from '@/lib/prestashop/types';

const getName = (name: string | { value: string }[]) => (typeof name === 'string' ? name : name[0]?.value ?? '');

export default async function MenuPage() {
  const categoriesResult = await getCategories();
  if (categoriesResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać kategorii Menu." />;
  }

  const menuCategory = (categoriesResult.data ?? []).find((category) => getName(category.name).toLowerCase() === 'menu');
  if (!menuCategory) {
    return <EmptyState title="Menu jest chwilowo niedostępne" description="Spróbuj ponownie za chwilę." />;
  }

  const categories = categoriesResult.data ?? [];
  const descendantIds = new Set<number>();
  const mapByParent = categories.reduce<Record<number, PSCategory[]>>((acc, category) => {
    const parentId = Number(category.id_parent);
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(category);
    return acc;
  }, {});

  const collect = (categoryId: number) => {
    descendantIds.add(categoryId);
    (mapByParent[categoryId] ?? []).forEach((child) => collect(child.id));
  };
  collect(menuCategory.id);

  const productsResult = await getProducts();
  if (productsResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać produktów Menu." />;
  }

  const products = (productsResult.data ?? []).filter((product) => {
    const productCategories = product.associations?.categories ?? [];
    return productCategories.some((entry) => descendantIds.has(Number(entry.id)));
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu</h1>
      <ProductGrid products={products} businessType="retail" />
    </div>
  );
}
