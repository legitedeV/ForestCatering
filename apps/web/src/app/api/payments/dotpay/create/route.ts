import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import { dotpayConfig, formatMajorFromMinor, getSiteUrl, sha256, toMinorUnits } from '@/lib/payments'

export async function POST(req: Request) {
  try {
    const { orderNumber } = await req.json() as { orderNumber?: string }
    if (!orderNumber) {
      return NextResponse.json({ error: 'Brak numeru zamówienia' }, { status: 400 })
    }

    const cms = await getPayload()
    const found = await cms.find({
      collection: 'orders',
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
      overrideAccess: true,
    })
    const order = found.docs[0]
    if (!order) {
      return NextResponse.json({ error: 'Nie znaleziono zamówienia' }, { status: 404 })
    }

    const cfg = dotpayConfig()
    const siteUrl = getSiteUrl()
    const sessionId = `${order.orderNumber}-${Date.now()}`
    const amountMinor = toMinorUnits(order.total)
    const amount = formatMajorFromMinor(amountMinor)

    const url = `${siteUrl}/payment/return?orderNumber=${encodeURIComponent(order.orderNumber)}`
    const urlc = `${siteUrl}/api/payments/dotpay/webhook`

    const chk = sha256(`${cfg.pin}${cfg.id}${sessionId}${amount}PLN${url}${urlc}`)

    const redirect = new URL(`${cfg.baseUrl}/${cfg.id}`)
    redirect.searchParams.set('id', cfg.id)
    redirect.searchParams.set('amount', amount)
    redirect.searchParams.set('currency', 'PLN')
    redirect.searchParams.set('description', `Zamówienie ${order.orderNumber}`)
    redirect.searchParams.set('control', sessionId)
    redirect.searchParams.set('email', order.customer?.email ?? '')
    redirect.searchParams.set('firstname', order.customer?.name?.split(' ')[0] ?? '')
    redirect.searchParams.set('lastname', order.customer?.name?.split(' ').slice(1).join(' ') ?? '')
    redirect.searchParams.set('url', url)
    redirect.searchParams.set('urlc', urlc)
    redirect.searchParams.set('lang', 'pl')
    redirect.searchParams.set('chk', chk)

    await cms.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: {
        status: 'pending_payment',
        paymentMethod: 'online',
        paymentProvider: 'dotpay',
        paymentSessionId: sessionId,
        paymentMeta: {
          ...(typeof order.paymentMeta === 'object' && order.paymentMeta ? order.paymentMeta : {}),
          dotpay: { amount, currency: 'PLN' },
        },
      },
    })

    return NextResponse.json({ redirectUrl: redirect.toString() })
  } catch (error) {
    console.error('[DOTPAY CREATE] Error:', error)
    return NextResponse.json({ error: 'Nie udało się utworzyć sesji Dotpay' }, { status: 500 })
  }
}
