import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber')
  if (!orderNumber) {
    return NextResponse.json({ error: 'Brak numeru zamówienia' }, { status: 400 })
  }

  try {
    const cms = await getPayload()
    const found = await cms.find({
      collection: 'orders',
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
      overrideAccess: true,
    })
    const order = found.docs[0]
    if (!order) return NextResponse.json({ error: 'Nie znaleziono zamówienia' }, { status: 404 })

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentProvider: order.paymentProvider,
      transactionId: order.transactionId,
      total: order.total,
    })
  } catch (error) {
    console.error('[ORDER STATUS] Error:', error)
    return NextResponse.json({ error: 'Błąd pobierania statusu' }, { status: 500 })
  }
}
