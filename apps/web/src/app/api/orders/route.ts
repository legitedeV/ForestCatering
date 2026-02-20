import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import { orderApiSchema } from '@/lib/validators'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = orderApiSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { customer, delivery, items, paymentMethod } = parsed.data

    const payload = await getPayload()

    const validatedItems = []
    const unavailable: string[] = []
    for (const item of items) {
      try {
        const product = await payload.findByID({ collection: 'products', id: item.productId })
        if (!product || !(product as Record<string, unknown>).isAvailable) {
          unavailable.push(item.productId)
          continue
        }
        const price = (product as Record<string, unknown>).price as number
        validatedItems.push({
          product: product.id,
          productName: (product as Record<string, unknown>).name as string,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal: price * item.quantity,
        })
      } catch {
        unavailable.push(item.productId)
      }
    }
    if (unavailable.length > 0) {
      return NextResponse.json(
        { error: 'Niektóre produkty są niedostępne', unavailable },
        { status: 400 }
      )
    }
    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'Brak produktów w zamówieniu' }, { status: 400 })
    }

    const subtotal = validatedItems.reduce((sum, i) => sum + i.lineTotal, 0)

    let deliveryFee = 1500
    let freeThreshold = 15000
    try {
      const settings = await payload.findGlobal({ slug: 'site-settings' as const })
      const s = settings as Record<string, unknown>
      if (s?.deliveryFee) deliveryFee = s.deliveryFee as number
      if (s?.freeDeliveryThreshold) freeThreshold = s.freeDeliveryThreshold as number
    } catch { /* use defaults */ }

    const actualDeliveryFee = subtotal >= freeThreshold ? 0 : deliveryFee
    const total = subtotal + actualDeliveryFee

    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber: '',
        status: 'pending',
        customer,
        deliveryAddress: {
          street: delivery.street,
          city: delivery.city,
          postalCode: delivery.postalCode,
          notes: delivery.notes || '',
        },
        deliveryDate: delivery.deliveryDate,
        deliveryTimeSlot: delivery.deliveryTimeSlot,
        items: validatedItems,
        subtotal,
        deliveryFee: actualDeliveryFee,
        total,
        paymentMethod,
        paymentStatus: 'unpaid',
      },
    })

    const orderData = order as Record<string, unknown>
    return NextResponse.json(
      { orderNumber: orderData.orderNumber, status: orderData.status },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation failed:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.' },
      { status: 500 }
    )
  }
}
