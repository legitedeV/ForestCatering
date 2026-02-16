import Link from 'next/link';

import { ProductGrid } from '@/components/products/ProductGrid';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getCategories } from '@/lib/prestashop/categories';
import { getProducts } from '@/lib/prestashop/products';

const getCategoryName = (name: string | { value: string }[]) => (typeof name === 'string' ? name : name[0]?.value ?? 'Kategoria');

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.all([getCategories(), getProducts()]);

  if (categoriesResult.error && productsResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać danych z backendu PrestaShop." />;
  }

  const categories = (categoriesResult.data ?? []).filter((category) => {
    const name = getCategoryName(category.name).toLowerCase();
    return name === 'menu' || name === 'eventy';
  });

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-fc-accent/20 bg-fc-bgElev p-8">
        <p className="text-sm uppercase tracking-[0.12em] text-fc-accent">ForestCatering Headless</p>
        <h1 className="mt-3 text-4xl font-bold">Catering i eventy dla Twojej firmy</h1>
        <p className="mt-3 max-w-2xl text-fc-muted">
          Wybierz ofertę z sekcji Menu lub Eventy i skonfiguruj zamówienie online.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/menu" className="rounded-full bg-fc-accent px-5 py-2 font-semibold text-black">
            Zobacz Menu
          </Link>
          <Link href="/eventy" className="rounded-full border border-fc-accent/40 px-5 py-2 font-semibold">
            Zobacz Eventy
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Kategorie</h2>
        {categories.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <article key={category.id} className="rounded-2xl border border-fc-accent/25 bg-fc-surface p-5">
                <h3 className="text-lg font-semibold">{getCategoryName(category.name)}</h3>
                <p className="mt-1 text-fc-muted">Sprawdź produkty dostępne w tej sekcji.</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-fc-muted">Brak kategorii do wyświetlenia.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Polecane produkty</h2>
        <div className="mt-4">
          <ProductGrid products={(productsResult.data ?? []).slice(0, 6)} businessType={null} isLoading={false} />
        </div>
      </section>
    </div>
  );
}
