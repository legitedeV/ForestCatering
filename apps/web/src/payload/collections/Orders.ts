import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { generateOrderNumber } from '../hooks/generateOrderNumber'
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
    beforeChange: [generateOrderNumber],
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
      defaultValue: 'pending',
      label: 'Status',
      options: [
        { label: 'Oczekujące', value: 'pending' },
        { label: 'Potwierdzone', value: 'confirmed' },
        { label: 'W przygotowaniu', value: 'preparing' },
        { label: 'Gotowe', value: 'ready' },
        { label: 'Dostarczone', value: 'delivered' },
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
        { name: 'productName', type: 'text', required: true, label: 'Nazwa produktu' },
        { name: 'quantity', type: 'number', required: true, min: 1, label: 'Ilość' },
        { name: 'unitPrice', type: 'number', required: true, label: 'Cena jednostkowa' },
        { name: 'lineTotal', type: 'number', required: true, label: 'Suma pozycji' },
      ],
    },
    { name: 'subtotal', type: 'number', required: true, label: 'Kwota netto' },
    { name: 'deliveryFee', type: 'number', defaultValue: 0, label: 'Koszt dostawy' },
    { name: 'total', type: 'number', required: true, label: 'Suma' },
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
      name: 'internalNotes',
      type: 'textarea',
      label: 'Notatki wewnętrzne',
      admin: { position: 'sidebar' },
    },
  ],
}
