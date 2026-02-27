import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import { getSiteUrl, p24Config, sha384, toMinorUnits } from '@/lib/payments'

export async function POST(req: Request) {
  try {
    const { orderNumber } = await req.json() as { orderNumber?: string }
    if (!orderNumber) {
      return NextResponse.json({ error: 'Brak numeru zamówienia' }, { status: 400 })
    }

    const payload = await getPayload()
    const result = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
      overrideAccess: true,
    })
    const order = result.docs[0]
    if (!order) return NextResponse.json({ error: 'Nie znaleziono zamówienia' }, { status: 404 })

    const cfg = p24Config()
    const siteUrl = getSiteUrl()
    const sessionId = `${order.orderNumber}-${Date.now()}`
    const amount = toMinorUnits(order.total)
    const sign = sha384(JSON.stringify({ sessionId, merchantId: cfg.merchantId, amount, currency: 'PLN', crc: cfg.crc }))

    const registerPayload = {
      merchantId: cfg.merchantId,
      posId: cfg.posId,
      sessionId,
      amount,
      currency: 'PLN',
      description: `Zamówienie ${order.orderNumber}`,
      email: order.customer?.email,
      country: 'PL',
      language: 'pl',
      urlReturn: `${siteUrl}/payment/return?orderNumber=${encodeURIComponent(order.orderNumber)}`,
      urlStatus: `${siteUrl}/api/payments/p24/webhook`,
      sign,
    }

    const auth = Buffer.from(`${cfg.posId}:${cfg.apiKey}`).toString('base64')
    const registerRes = await fetch(`${cfg.baseUrl}/api/v1/transaction/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(registerPayload),
    })
    const registerData = await registerRes.json()
    if (!registerRes.ok || registerData?.data?.token == null) {
      return NextResponse.json({ error: 'Błąd rejestracji płatności P24', details: registerData }, { status: 502 })
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: {
        status: 'pending_payment',
        paymentMethod: 'online',
        paymentProvider: 'p24',
        paymentSessionId: sessionId,
        transactionId: String(registerData.data.token),
        paymentMeta: {
          ...(typeof order.paymentMeta === 'object' && order.paymentMeta ? order.paymentMeta : {}),
          p24: registerData,
        },
      },
    })

    const redirectUrl = `${cfg.baseUrl}/trnRequest/${registerData.data.token}`
    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('[P24 CREATE] Error:', error)
    return NextResponse.json({ error: 'Nie udało się utworzyć sesji P24' }, { status: 500 })
  }
}
