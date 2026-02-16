import type {
  PSCollectionResponse,
  PSFeature,
  PSFeatureValue,
  PSProduct,
  PSResult
} from '@/lib/prestashop/types';
import { prestashopFetch } from '@/lib/prestashop/client';

const normalizeLanguageValue = (value: string | { value: string }[] | undefined): string => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value[0]?.value ?? '';
};

export const getFeatures = async (): Promise<PSResult<PSFeature[]>> => {
  const result = await prestashopFetch<PSCollectionResponse<PSFeature>>('/api/product_features?display=full');

  return {
    data: result.data?.product_features ?? [],
    error: result.error
  };
};

export const getFeatureValues = async (featureId: number): Promise<PSResult<PSFeatureValue[]>> => {
  const result = await prestashopFetch<PSCollectionResponse<PSFeatureValue>>(
    `/api/product_feature_values?filter[id_feature]=${featureId}&display=full`
  );

  return {
    data: result.data?.product_feature_values ?? [],
    error: result.error
  };
};

export const resolveBusinessType = (
  product: PSProduct,
  features: PSFeature[],
  featureValues: PSFeatureValue[]
): 'retail' | 'event' | null => {
  const businessFeature = features.find(
    (feature) => normalizeLanguageValue(feature.name).toLowerCase() === 'typ biznesowy'
  );

  if (!businessFeature) {
    return null;
  }

  const productFeature = product.associations?.product_features?.find(
    (feature) => Number(feature.id) === businessFeature.id
  );

  if (!productFeature) {
    return null;
  }

  const selectedFeatureValue = featureValues.find(
    (value) => value.id === Number(productFeature.id_feature_value)
  );

  const businessValue = normalizeLanguageValue(selectedFeatureValue?.value).toLowerCase();

  if (businessValue === 'retail' || businessValue === 'event') {
    return businessValue;
  }

  return null;
};

export const getBusinessType = async (product: PSProduct): Promise<'retail' | 'event' | null> => {
  const featuresResult = await getFeatures();
  const features = featuresResult.data ?? [];

  const businessFeature = features.find(
    (feature) => normalizeLanguageValue(feature.name).toLowerCase() === 'typ biznesowy'
  );

  if (!businessFeature) {
    return null;
  }

  const valuesResult = await getFeatureValues(businessFeature.id);
  return resolveBusinessType(product, features, valuesResult.data ?? []);
};
