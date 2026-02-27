import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import { p24Config, sha384 } from '@/lib/payments'

export async function POST(req: Request) {
  try {
    const payload = await req.json() as {
      sessionId?: string
      orderId?: number
      amount?: number
      currency?: string
      sign?: string
    }

    const cfg = p24Config()
    const expected = sha384(JSON.stringify({
      sessionId: payload.sessionId,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      crc: cfg.crc,
    }))

    if (!payload.sign || payload.sign !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const cms = await getPayload()
    const found = await cms.find({
      collection: 'orders',
      where: { paymentSessionId: { equals: payload.sessionId } },
      limit: 1,
      overrideAccess: true,
    })
    const order = found.docs[0]
    if (!order) {
      return NextResponse.json({ ok: true })
    }
    if (order.status === 'paid') {
      return NextResponse.json({ ok: true, idempotent: true })
    }

    const auth = Buffer.from(`${cfg.posId}:${cfg.apiKey}`).toString('base64')
    const verifySign = sha384(JSON.stringify({
      sessionId: payload.sessionId,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      crc: cfg.crc,
    }))

    const verifyRes = await fetch(`${cfg.baseUrl}/api/v1/transaction/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        merchantId: cfg.merchantId,
        posId: cfg.posId,
        sessionId: payload.sessionId,
        amount: payload.amount,
        currency: payload.currency,
        orderId: payload.orderId,
        sign: verifySign,
      }),
    })

    const verifyData = await verifyRes.json().catch(() => ({}))
    if (!verifyRes.ok || verifyData?.data?.status !== 'success') {
      await cms.update({
        collection: 'orders',
        id: order.id,
        overrideAccess: true,
        data: {
          status: 'failed',
          paymentStatus: 'unpaid',
          paymentMeta: {
            ...(typeof order.paymentMeta === 'object' && order.paymentMeta ? order.paymentMeta : {}),
            p24Webhook: payload,
            p24Verify: verifyData,
          },
        },
      })
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    await cms.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: {
        status: 'paid',
        paymentStatus: 'paid',
        transactionId: String(payload.orderId),
        paymentMeta: {
          ...(typeof order.paymentMeta === 'object' && order.paymentMeta ? order.paymentMeta : {}),
          p24Webhook: payload,
          p24Verify: verifyData,
        },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[P24 WEBHOOK] Error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
