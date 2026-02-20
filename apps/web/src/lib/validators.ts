import { z } from 'zod'

export const checkoutContactSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string()
    .min(9, 'Numer telefonu jest wymagany')
    .regex(/^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/, 'Nieprawidłowy format numeru'),
  company: z.string().optional().or(z.literal('')),
  nip: z.string()
    .refine(v => !v || v.length === 10, 'NIP musi mieć 10 cyfr')
    .optional()
    .or(z.literal('')),
})

export const checkoutDeliverySchema = z.object({
  street: z.string().min(3, 'Adres jest wymagany'),
  city: z.string().min(2, 'Miasto jest wymagane'),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Format: XX-XXX'),
  deliveryDate: z.string().min(1, 'Data dostawy jest wymagana'),
  deliveryTimeSlot: z.enum(
    ['8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'],
    { errorMap: () => ({ message: 'Wybierz przedział czasowy' }) }
  ),
  notes: z.string().optional().or(z.literal('')),
})

export const orderApiSchema = z.object({
  customer: checkoutContactSchema,
  delivery: checkoutDeliverySchema,
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
  })).min(1, 'Koszyk nie może być pusty'),
  paymentMethod: z.enum(['transfer', 'cash']),
})

export type CheckoutContact = z.infer<typeof checkoutContactSchema>
export type CheckoutDelivery = z.infer<typeof checkoutDeliverySchema>
export type OrderApiInput = z.infer<typeof orderApiSchema>

export function getMinDeliveryDate(): string {
  const date = new Date()
  let businessDays = 0
  while (businessDays < 2) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) businessDays++
  }
  return date.toISOString().split('T')[0]
}
