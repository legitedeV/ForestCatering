import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventConfigurator } from '@/components/products/EventConfigurator';

describe('EventConfigurator', () => {
  it('renders required fields', () => {
    render(<EventConfigurator productName="Pakiet" basePrice={100} minQuantity={10} />);

    expect(screen.getByLabelText('Liczba osób')).toBeInTheDocument();
    expect(screen.getByLabelText('Data wydarzenia')).toBeInTheDocument();
    expect(screen.getByLabelText('Godzina wydarzenia')).toBeInTheDocument();
    expect(screen.getByLabelText('Adres realizacji')).toBeInTheDocument();
    expect(screen.getByLabelText('Dodatkowe uwagi')).toBeInTheDocument();
  });

  it('enforces minimal quantity', () => {
    render(<EventConfigurator productName="Pakiet" basePrice={100} minQuantity={10} />);

    fireEvent.change(screen.getByLabelText('Liczba osób'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj do koszyka' }));

    expect(screen.getByText('Minimalna liczba osób dla tego pakietu to 10.')).toBeInTheDocument();
  });

  it('computes price based on guest count', () => {
    render(<EventConfigurator productName="Pakiet" basePrice={189} minQuantity={10} />);

    fireEvent.change(screen.getByLabelText('Liczba osób'), { target: { value: '12' } });

    expect(screen.getByText('Cena łączna: 2268.00 PLN')).toBeInTheDocument();
  });
});
