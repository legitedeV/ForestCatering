import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '@/app/page';

vi.mock('@/lib/prestashop/categories', () => ({
  getCategories: vi.fn().mockResolvedValue({
    data: [
      { id: 1, name: 'Menu', id_parent: '0' },
      { id: 2, name: 'Eventy', id_parent: '0' }
    ],
    error: null
  })
}));

vi.mock('@/lib/prestashop/products', () => ({
  getProducts: vi.fn().mockResolvedValue({
    data: [{ id: 10, name: 'Kanapka', price: '24.99', active: '1' }],
    error: null
  })
}));

describe('Landing page', () => {
  it('renders without crash using mocked API data', async () => {
    const ui = await HomePage();
    render(ui);

    expect(screen.getByText('Catering i eventy dla Twojej firmy')).toBeInTheDocument();
    expect(screen.getByText('Kategorie')).toBeInTheDocument();
    expect(screen.getByText('Kanapka')).toBeInTheDocument();
  });
});
