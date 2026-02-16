export interface PSLanguageField {
  id?: string;
  value: string;
}

export interface PSProductFeatureAssociation {
  id: string;
  id_feature_value: string;
}

export interface PSProductCategoryAssociation {
  id: string;
}

export interface PSCustomizationField {
  id: number;
  id_product?: string;
  name: string | PSLanguageField[];
  type: string;
  required: string;
}

export interface PSProduct {
  id: number;
  name: string | PSLanguageField[];
  price: string;
  active: string;
  id_category_default?: string;
  customizable?: string;
  minimal_quantity?: string;
  quantity?: string;
  description_short?: string | PSLanguageField[];
  description?: string | PSLanguageField[];
  associations?: {
    categories?: PSProductCategoryAssociation[];
    product_features?: PSProductFeatureAssociation[];
    product_customization_fields?: PSCustomizationField[];
  };
}

export interface PSCategory {
  id: number;
  name: string | PSLanguageField[];
  id_parent: string;
  active?: string;
}

export interface PSFeature {
  id: number;
  name: string | PSLanguageField[];
}

export interface PSFeatureValue {
  id: number;
  value: string | PSLanguageField[];
  id_feature: string;
}

export interface PSTreeCategory extends PSCategory {
  children: PSTreeCategory[];
}

export interface PSResult<T> {
  data: T | null;
  error: string | null;
}

export interface PSCollectionResponse<T> {
  [resource: string]: T[];
}
