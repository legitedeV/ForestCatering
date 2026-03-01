import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { generateOrderNumber } from '../hooks/generateOrderNumber'
import { populateOrderItems } from '../hooks/populateOrderItems'
import { sendOrderConfirmationEmail } from '../hooks/sendOrderEmail'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Zamówienie', plural: 'Zamówienia' },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'createdAt'],
  },
  access: {
    read: isAdminOrEditor,
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [populateOrderItems, generateOrderNumber],
    afterChange: [sendOrderConfirmationEmail],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Numer zamówienia',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_payment',
      label: 'Status',
      options: [
        { label: 'Oczekuje na płatność', value: 'pending_payment' },
        { label: 'Opłacone', value: 'paid' },
        { label: 'Płatność nieudana', value: 'failed' },
        { label: 'W realizacji (legacy)', value: 'confirmed' },
        { label: 'W przygotowaniu (legacy)', value: 'preparing' },
        { label: 'Gotowe (legacy)', value: 'ready' },
        { label: 'Dostarczone (legacy)', value: 'delivered' },
        { label: 'Anulowane', value: 'cancelled' },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      label: 'Klient',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Imię i nazwisko' },
        { name: 'email', type: 'email', required: true, label: 'E-mail' },
        { name: 'phone', type: 'text', required: true, label: 'Telefon' },
        { name: 'company', type: 'text', label: 'Firma' },
        { name: 'nip', type: 'text', label: 'NIP' },
      ],
    },
    {
      name: 'deliveryAddress',
      type: 'group',
      label: 'Adres dostawy',
      fields: [
        { name: 'street', type: 'text', required: true, label: 'Ulica' },
        { name: 'city', type: 'text', required: true, defaultValue: 'Szczecin', label: 'Miasto' },
        { name: 'postalCode', type: 'text', required: true, label: 'Kod pocztowy' },
        { name: 'notes', type: 'textarea', label: 'Uwagi do dostawy' },
      ],
    },
    { name: 'deliveryDate', type: 'date', required: true, label: 'Data dostawy' },
    {
      name: 'deliveryTimeSlot',
      type: 'select',
      required: true,
      label: 'Godzina dostawy',
      options: ['8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Pozycje zamówienia',
      labels: { singular: 'Pozycja', plural: 'Pozycje' },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', label: 'Produkt' },
        { name: 'productName', type: 'text', required: true, label: 'Nazwa produktu', admin: { description: 'Wypełniane automatycznie z wybranego produktu' } },
        { name: 'quantity', type: 'number', required: true, min: 1, label: 'Ilość' },
        { name: 'unitPrice', type: 'number', required: true, label: 'Cena jednostkowa', admin: { description: 'Wypełniane automatycznie z ceny produktu (w groszach)' } },
        { name: 'lineTotal', type: 'number', required: true, label: 'Suma pozycji', admin: { readOnly: true, description: 'Obliczane automatycznie: ilość × cena' } },
      ],
    },
    { name: 'subtotal', type: 'number', required: true, label: 'Kwota netto', admin: { readOnly: true, description: 'Obliczane automatycznie z pozycji' } },
    { name: 'deliveryFee', type: 'number', defaultValue: 0, label: 'Koszt dostawy' },
    { name: 'total', type: 'number', required: true, label: 'Suma', admin: { readOnly: true, description: 'Obliczane automatycznie: kwota netto + koszt dostawy' } },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'transfer',
      label: 'Metoda płatności',
      options: [
        { label: 'Przelew', value: 'transfer' },
        { label: 'Gotówka', value: 'cash' },
        { label: 'Online', value: 'online' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      label: 'Status płatności',
      options: [
        { label: 'Nieopłacone', value: 'unpaid' },
        { label: 'Opłacone', value: 'paid' },
        { label: 'Zwrócone', value: 'refunded' },
      ],
    },

    {
      name: 'paymentProvider',
      type: 'select',
      label: 'Provider płatności',
      options: [
        { label: 'Przelewy24', value: 'p24' },
        { label: 'Dotpay', value: 'dotpay' },
      ],
    },
    {
      name: 'paymentSessionId',
      type: 'text',
      label: 'Session ID płatności',
      admin: { readOnly: true },
    },
    {
      name: 'transactionId',
      type: 'text',
      label: 'ID transakcji',
      admin: { readOnly: true },
    },
    {
      name: 'paymentMeta',
      type: 'json',
      label: 'Dane techniczne płatności',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Notatki wewnętrzne',
      admin: { position: 'sidebar' },
    },
  ],
}
