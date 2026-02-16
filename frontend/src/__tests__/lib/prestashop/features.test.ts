import { describe, expect, it } from 'vitest';

import { resolveBusinessType } from '@/lib/prestashop/features';
import type { PSFeature, PSFeatureValue, PSProduct } from '@/lib/prestashop/types';

const features: PSFeature[] = [{ id: 1, name: 'Typ biznesowy' }];

const productBase: PSProduct = {
  id: 10,
  name: 'Produkt testowy',
  price: '10.00',
  active: '1',
  associations: {
    product_features: [{ id: '1', id_feature_value: '2' }]
  }
};

describe('resolveBusinessType', () => {
  it('returns retail', () => {
    const values: PSFeatureValue[] = [{ id: 2, id_feature: '1', value: 'retail' }];
    expect(resolveBusinessType(productBase, features, values)).toBe('retail');
  });

  it('returns event', () => {
    const values: PSFeatureValue[] = [{ id: 2, id_feature: '1', value: 'event' }];
    expect(resolveBusinessType(productBase, features, values)).toBe('event');
  });

  it('returns null for missing mapping', () => {
    expect(resolveBusinessType(productBase, features, [])).toBeNull();
  });
});
