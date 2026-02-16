'use client';

import { useMemo, useState } from 'react';

interface EventConfiguratorProps {
  productName: string;
  basePrice: number;
  minQuantity: number;
}

export const EventConfigurator = ({ productName, basePrice, minQuantity }: EventConfiguratorProps) => {
  const [guests, setGuests] = useState(minQuantity);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showError, setShowError] = useState(false);

  const totalPrice = useMemo(() => basePrice * guests, [basePrice, guests]);

  return (
    <form
      className="space-y-4 rounded-2xl border border-fc-accent/25 bg-fc-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (guests < minQuantity) {
          setShowError(true);
          return;
        }
        setShowError(false);
      }}
    >
      <h2 className="text-2xl font-semibold">Konfigurator eventu: {productName}</h2>

      <label className="block text-sm text-fc-muted" htmlFor="guests">
        Liczba osób
      </label>
      <input
        id="guests"
        name="guests"
        type="number"
        min={minQuantity}
        value={guests}
        onChange={(event) => setGuests(Number(event.target.value))}
        className="w-full rounded-xl border border-fc-accent/40 bg-fc-bg px-3 py-2"
      />

      <label className="block text-sm text-fc-muted" htmlFor="date">
        Data wydarzenia
      </label>
      <input
        id="date"
        name="date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="w-full rounded-xl border border-fc-accent/40 bg-fc-bg px-3 py-2"
      />

      <label className="block text-sm text-fc-muted" htmlFor="time">
        Godzina wydarzenia
      </label>
      <input
        id="time"
        name="time"
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        className="w-full rounded-xl border border-fc-accent/40 bg-fc-bg px-3 py-2"
      />

      <label className="block text-sm text-fc-muted" htmlFor="address">
        Adres realizacji
      </label>
      <input
        id="address"
        name="address"
        type="text"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        className="w-full rounded-xl border border-fc-accent/40 bg-fc-bg px-3 py-2"
      />

      <label className="block text-sm text-fc-muted" htmlFor="notes">
        Dodatkowe uwagi
      </label>
      <textarea
        id="notes"
        name="notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="w-full rounded-xl border border-fc-accent/40 bg-fc-bg px-3 py-2"
      />

      <p className="text-lg font-semibold">Cena łączna: {totalPrice.toFixed(2)} PLN</p>

      {showError ? (
        <p className="text-sm text-red-300">Minimalna liczba osób dla tego pakietu to {minQuantity}.</p>
      ) : null}

      <button type="submit" className="rounded-full bg-fc-accent px-5 py-2 font-semibold text-black">
        Dodaj do koszyka
      </button>
    </form>
  );
};
