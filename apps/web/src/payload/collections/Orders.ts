import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { generateOrderNumber } from '../hooks/generateOrderNumber'
import { sendOrderConfirmationEmail } from '../hooks/sendOrderEmail'

export const Orders: CollectionConfig = {
  slug: 'orders',
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
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'company', type: 'text' },
        { name: 'nip', type: 'text' },
      ],
    },
    {
      name: 'deliveryAddress',
      type: 'group',
      fields: [
        { name: 'street', type: 'text', required: true },
        { name: 'city', type: 'text', required: true, defaultValue: 'Szczecin' },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'notes', type: 'textarea' },
      ],
    },
    { name: 'deliveryDate', type: 'date', required: true },
    {
      name: 'deliveryTimeSlot',
      type: 'select',
      required: true,
      options: ['8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'productName', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'lineTotal', type: 'number', required: true },
      ],
    },
    { name: 'subtotal', type: 'number', required: true },
    { name: 'deliveryFee', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'transfer',
      options: ['transfer', 'cash', 'online'],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: ['unpaid', 'paid', 'refunded'],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { position: 'sidebar' },
    },
  ],
}
