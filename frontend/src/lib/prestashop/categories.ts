import type { PSCategory, PSCollectionResponse, PSResult, PSTreeCategory } from '@/lib/prestashop/types';
import { prestashopFetch } from '@/lib/prestashop/client';

const normalizeCategories = (payload: PSCollectionResponse<PSCategory> | null): PSCategory[] => {
  if (!payload) {
    return [];
  }

  return payload.categories ?? [];
};

export const getCategories = async (): Promise<PSResult<PSCategory[]>> => {
  const result = await prestashopFetch<PSCollectionResponse<PSCategory>>('/api/categories?display=full');

  return {
    data: normalizeCategories(result.data),
    error: result.error
  };
};

export const getCategory = async (id: number): Promise<PSResult<PSCategory>> => {
  const result = await prestashopFetch<{ category: PSCategory }>(`/api/categories/${id}?display=full`);

  return {
    data: result.data?.category ?? null,
    error: result.error
  };
};

export const getCategoryTree = async (): Promise<PSResult<PSTreeCategory[]>> => {
  const categoriesResult = await getCategories();
  const categories = categoriesResult.data ?? [];

  const nodes: Record<number, PSTreeCategory> = {};
  const roots: PSTreeCategory[] = [];

  categories.forEach((category) => {
    nodes[category.id] = { ...category, children: [] };
  });

  categories.forEach((category) => {
    const parentId = Number(category.id_parent);
    const node = nodes[category.id];

    if (parentId > 0 && nodes[parentId]) {
      nodes[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return {
    data: roots,
    error: categoriesResult.error
  };
};
