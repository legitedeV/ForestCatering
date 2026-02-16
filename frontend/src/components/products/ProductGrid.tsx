import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PSProduct } from '@/lib/prestashop/types';

interface ProductGridProps {
  products: PSProduct[];
  businessType: 'retail' | 'event' | null;
  isLoading?: boolean;
}

export const ProductGrid = ({ products, businessType, isLoading = false }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} businessType={businessType} />
      ))}
    </div>
  );
};
