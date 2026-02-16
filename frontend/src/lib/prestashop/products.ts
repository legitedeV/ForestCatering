import type { PSCollectionResponse, PSProduct, PSResult } from '@/lib/prestashop/types';
import { prestashopFetch } from '@/lib/prestashop/client';

const normalizeProducts = (payload: PSCollectionResponse<PSProduct> | null): PSProduct[] => {
  if (!payload) {
    return [];
  }

  return payload.products ?? [];
};

export const getProducts = async (): Promise<PSResult<PSProduct[]>> => {
  const result = await prestashopFetch<PSCollectionResponse<PSProduct>>('/api/products?filter[active]=1&display=full');

  return {
    data: normalizeProducts(result.data),
    error: result.error
  };
};

export const getProduct = async (id: number): Promise<PSResult<PSProduct>> => {
  const result = await prestashopFetch<{ product: PSProduct }>(`/api/products/${id}?display=full`);

  return {
    data: result.data?.product ?? null,
    error: result.error
  };
};

export const getProductsByCategory = async (categoryId: number): Promise<PSResult<PSProduct[]>> => {
  const result = await prestashopFetch<PSCollectionResponse<PSProduct>>(
    `/api/products?filter[active]=1&filter[id_category_default]=${categoryId}&display=full`
  );

  return {
    data: normalizeProducts(result.data),
    error: result.error
  };
};
