import { notFound } from 'next/navigation';

import { EventConfigurator } from '@/components/products/EventConfigurator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  BUSINESS_TYPE_FEATURE_NAME,
  getFeatureValues,
  getFeatures,
  normalizeLanguageValue,
  resolveBusinessType
} from '@/lib/prestashop/features';
import { getProduct } from '@/lib/prestashop/products';

const parseIdFromSlug = (slug: string): number => Number(slug.split('-')[0]);
const getName = (name: string | { value: string }[]) => (typeof name === 'string' ? name : name[0]?.value ?? 'Pakiet eventowy');

export default async function EventProductPage({ params }: { params: { slug: string } }) {
  const productId = parseIdFromSlug(params.slug);
  if (!productId) {
    notFound();
  }

  const productResult = await getProduct(productId);
  if (productResult.error) {
    return <ErrorBoundary message="Nie udało się pobrać pakietu eventowego." />;
  }

  const product = productResult.data;
  if (!product) {
    return <EmptyState title="Nie znaleziono pakietu" description="Sprawdź poprawność adresu URL." />;
  }

  const featuresResult = await getFeatures();
  const businessFeature = (featuresResult.data ?? []).find(
    (feature) => normalizeLanguageValue(feature.name).toLowerCase() === BUSINESS_TYPE_FEATURE_NAME
  );
  const featureValuesResult = businessFeature ? await getFeatureValues(businessFeature.id) : { data: [], error: null };

  const businessType = resolveBusinessType(product, featuresResult.data ?? [], featureValuesResult.data ?? []);
  if (businessType !== 'event') {
    return <EmptyState title="To nie jest pakiet eventowy" description="Wybierz produkt z sekcji Eventy." />;
  }

  const customizable = Number(product.customizable ?? '0') > 0;
  if (!customizable) {
    return <EmptyState title="Brak pól personalizacji" description="Ten produkt nie ma aktywnej konfiguracji eventowej." />;
  }

  const minQuantity = Number(product.minimal_quantity ?? '1') || 1;

  return (
    <EventConfigurator
      productName={getName(product.name)}
      basePrice={Number(product.price)}
      minQuantity={minQuantity}
    />
  );
}
